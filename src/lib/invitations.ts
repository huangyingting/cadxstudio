import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { InvitationStatus, Role } from '@prisma/client';
import { prisma } from './prisma';
import { writeAuditLog } from './audit';

export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateInviteCode(prefix = 'CADX'): string {
  const partA = crypto.randomBytes(3).toString('hex').toUpperCase();
  const partB = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${partA}-${partB}`;
}

export interface CreateInvitationInput {
  code?: string;
  email?: string | null;
  role?: Role;
  maxUses?: number;
  expiresInHours?: number;
  note?: string | null;
  createdById?: string | null;
  actorEmail?: string | null;
  ipAddress?: string | null;
}

export async function createInvitation(input: CreateInvitationInput) {
  const code = input.code ? normalizeInviteCode(input.code) : generateInviteCode();
  const email = input.email ? normalizeEmail(input.email) : null;
  const role: Role = input.role ?? 'MEMBER';
  const maxUses = Math.max(1, Math.min(1000, Number(input.maxUses ?? 1)));
  const expiresInHours = Math.max(1, Math.min(24 * 365, Number(input.expiresInHours ?? 72)));
  const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);

  const invitation = await prisma.invitation.create({
    data: {
      code,
      email,
      role,
      status: 'ACTIVE',
      maxUses,
      usedCount: 0,
      note: input.note?.trim() || null,
      expiresAt,
      createdById: input.createdById ?? null,
    },
  });

  await writeAuditLog({
    actorId: input.createdById ?? null,
    actorEmail: input.actorEmail ?? null,
    action: 'INVITATION_CREATED',
    targetType: 'Invitation',
    targetId: invitation.id,
    details: {
      code: invitation.code,
      role: invitation.role,
      email: invitation.email,
      maxUses: invitation.maxUses,
      expiresAt: invitation.expiresAt.toISOString(),
    },
    ipAddress: input.ipAddress ?? null,
  });

  return invitation;
}

export async function validateInvitationCode(rawCode: string, candidateEmail?: string) {
  const code = normalizeInviteCode(rawCode || '');
  if (!code) {
    return { valid: false as const, reason: 'Invitation code is required.' };
  }

  const invitation = await prisma.invitation.findUnique({
    where: { code },
  });

  if (!invitation) {
    return { valid: false as const, reason: 'Invalid invitation code.' };
  }

  if (invitation.status === 'REVOKED' || invitation.revokedAt) {
    return { valid: false as const, reason: 'This invitation code has been revoked.' };
  }

  const now = new Date();
  if (invitation.expiresAt <= now || invitation.status === 'EXPIRED') {
    if (invitation.status === 'ACTIVE') {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
    }
    return { valid: false as const, reason: 'This invitation code has expired.' };
  }

  if (invitation.status === 'USED' || invitation.usedCount >= invitation.maxUses) {
    return { valid: false as const, reason: 'This invitation code has already been used.' };
  }

  if (invitation.email && candidateEmail) {
    if (normalizeEmail(candidateEmail) !== normalizeEmail(invitation.email)) {
      return {
        valid: false as const,
        reason: `This invitation is restricted to ${invitation.email}.`,
      };
    }
  }

  return {
    valid: true as const,
    invitation: {
      id: invitation.id,
      code: invitation.code,
      email: invitation.email,
      role: invitation.role,
      maxUses: invitation.maxUses,
      usedCount: invitation.usedCount,
      expiresAt: invitation.expiresAt,
    },
  };
}

export interface RegisterWithInviteInput {
  invitationCode: string;
  email: string;
  name: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function redeemInvitationAndRegisterUser(input: RegisterWithInviteInput) {
  const email = normalizeEmail(input.email);
  const code = normalizeInviteCode(input.invitationCode);
  const name = input.name.trim();

  if (!email || ! email.includes('@')) {
    throw new Error('A valid email address is required.');
  }
  if (name.length < 2) {
    throw new Error('Name must be at least 2 characters.');
  }
  if (!input.password || input.password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const check = await validateInvitationCode(code, email);
  if (!check.valid) {
    await writeAuditLog({
      actorEmail: email,
      action: 'USER_REGISTER_REJECTED_INVITE',
      targetType: 'Invitation',
      targetId: code,
      details: { reason: check.reason, email, code },
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });
    throw new Error(check.reason);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const assignedRole = check.invitation.role;
  const planTier = assignedRole === 'ADMIN' || assignedRole === 'ENGINEER' ? 'engineer' : 'pro';
  const initialCredits = assignedRole === 'ADMIN' ? 1000 : assignedRole === 'ENGINEER' ? 400 : 200;

  const result = await prisma.$transaction(async (tx) => {
    const freshInvite = await tx.invitation.findUnique({ where: { id: check.invitation.id } });
    if (
      !freshInvite ||
      freshInvite.status !== 'ACTIVE' ||
      freshInvite.revokedAt ||
      freshInvite.expiresAt <= new Date() ||
      freshInvite.usedCount >= freshInvite.maxUses
    ) {
      throw new Error('Invitation is no longer available.');
    }

    const user = await tx.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: assignedRole,
        planTier,
        creditsBalance: initialCredits,
      },
    });

    const newUsedCount = freshInvite.usedCount + 1;
    const newStatus: InvitationStatus =
      newUsedCount >= freshInvite.maxUses ? 'USED' : 'ACTIVE';

    await tx.invitation.update({
      where: { id: freshInvite.id },
      data: {
        usedCount: newUsedCount,
        usedById: user.id,
        usedAt: newStatus === 'USED' ? new Date() : freshInvite.usedAt,
        status: newStatus,
      },
    });

    await tx.invitationRedemption.create({
      data: {
        invitationId: freshInvite.id,
        userId: user.id,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });

    await tx.paymentTransaction.create({
      data: {
        userId: user.id,
        planId: planTier,
        description: `Invite Onboarding Credit Grant (${freshInvite.code})`,
        amountCents: 0,
        creditsAdded: initialCredits,
        status: 'succeeded',
      },
    });

    return { user, invitation: freshInvite };
  });

  await writeAuditLog({
    actorId: result.user.id,
    actorEmail: result.user.email,
    action: 'INVITATION_REDEEMED',
    targetType: 'Invitation',
    targetId: result.invitation.id,
    details: {
      code: result.invitation.code,
      assignedRole: result.user.role,
      planTier: result.user.planTier,
    },
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  });

  await writeAuditLog({
    actorId: result.user.id,
    actorEmail: result.user.email,
    action: 'USER_REGISTERED',
    targetType: 'User',
    targetId: result.user.id,
    details: {
      email: result.user.email,
      role: result.user.role,
      invitationCode: result.invitation.code,
    },
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  });

  return result.user;
}

export async function revokeInvitation(params: {
  invitationId: string;
  actorId?: string | null;
  actorEmail?: string | null;
  ipAddress?: string | null;
}) {
  const updated = await prisma.invitation.update({
    where: { id: params.invitationId },
    data: {
      status: 'REVOKED',
      revokedAt: new Date(),
    },
  });

  await writeAuditLog({
    actorId: params.actorId ?? null,
    actorEmail: params.actorEmail ?? null,
    action: 'INVITATION_REVOKED',
    targetType: 'Invitation',
    targetId: updated.id,
    details: { code: updated.code },
    ipAddress: params.ipAddress ?? null,
  });

  return updated;
}

export async function bootstrapAdminAccount(params: {
  email: string;
  password: string;
  name?: string;
  inviteCode?: string;
}) {
  const email = normalizeEmail(params.email);
  const name = (params.name || 'CADx Platform Admin').trim();
  const passwordHash = await bcrypt.hash(params.password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          passwordHash,
          role: 'ADMIN',
          planTier: 'engineer',
          isActive: true,
          creditsBalance: Math.max(existing.creditsBalance, 1000),
        },
      })
    : await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'ADMIN',
          planTier: 'engineer',
          creditsBalance: 1000,
          isActive: true,
        },
      });

  let invitation = null;
  if (params.inviteCode) {
    const code = normalizeInviteCode(params.inviteCode);
    invitation = await prisma.invitation.upsert({
      where: { code },
      update: {
        status: 'ACTIVE',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
      create: {
        code,
        role: 'ENGINEER',
        status: 'ACTIVE',
        maxUses: 10,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        createdById: user.id,
        note: 'Bootstrap Admin Invitation',
      },
    });
  }

  await writeAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    action: 'ADMIN_BOOTSTRAPPED',
    targetType: 'User',
    targetId: user.id,
    details: {
      created: !existing,
      email: user.email,
      role: user.role,
      inviteCode: invitation?.code ?? null,
    },
  });

  return { user, created: !existing, invitation };
}
