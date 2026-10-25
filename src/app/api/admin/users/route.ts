import { NextRequest, NextResponse } from 'next/server';
import type { Role } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      planTier: true,
      creditsBalance: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { projects: true } },
    },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const targetId = String(body.userId);
    const data: Record<string, unknown> = {};
    if (body.role) data.role = body.role as Role;
    if (body.planTier) data.planTier = String(body.planTier);
    if (typeof body.creditsBalance === 'number') data.creditsBalance = body.creditsBalance;
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;

    const updated = await prisma.user.update({
      where: { id: targetId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        planTier: true,
        creditsBalance: true,
        isActive: true,
      },
    });

    await writeAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'ADMIN_USER_UPDATED',
      targetType: 'User',
      targetId: updated.id,
      details: data,
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Update failed' },
      { status: 400 }
    );
  }
}
