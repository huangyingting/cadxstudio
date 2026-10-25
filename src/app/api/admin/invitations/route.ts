import { NextRequest, NextResponse } from 'next/server';
import type { Role } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createInvitation, revokeInvitation } from '@/lib/invitations';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, email: true, name: true } },
      usedBy: { select: { id: true, email: true, name: true } },
      redemptions: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
    },
  });

  return NextResponse.json({ invitations });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const invitation = await createInvitation({
      code: body.code ? String(body.code) : undefined,
      email: body.email ? String(body.email) : null,
      role: (body.role as Role) || 'MEMBER',
      maxUses: Number(body.maxUses ?? 1),
      expiresInHours: Number(body.expiresInHours ?? 72),
      note: body.note ? String(body.note) : null,
      createdById: user.id,
      actorEmail: user.email,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create invitation' },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const updated = await revokeInvitation({
      invitationId: String(body.invitationId),
      actorId: user.id,
      actorEmail: user.email,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ invitation: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to revoke invitation' },
      { status: 400 }
    );
  }
}
