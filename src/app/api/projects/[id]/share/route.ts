import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  const project = await prisma.designProject.findUnique({
    where: { id },
    include: {
      shares: true,
      shareLinks: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!project || (project.userId !== user.id && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    shares: project.shares,
    shareLinks: project.shareLinks,
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  const project = await prisma.designProject.findUnique({ where: { id } });
  if (!project || (project.userId !== user.id && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();

  if (body.action === 'create_link') {
    const shareToken = crypto.randomBytes(12).toString('hex');
    const link = await prisma.projectShareLink.create({
      data: {
        projectId: project.id,
        token: shareToken,
        isActive: true,
      },
    });
    return NextResponse.json(
      { shareLink: { ...link, shareToken: link.token } },
      { status: 201 }
    );
  }

  if (body.action === 'revoke_link' && body.linkId) {
    const updated = await prisma.projectShareLink.update({
      where: { id: String(body.linkId) },
      data: { isActive: false },
    });
    return NextResponse.json({ shareLink: updated });
  }

  if (body.action === 'invite_email' && body.email) {
    const email = String(body.email).trim().toLowerCase();
    const share = await prisma.projectShare.upsert({
      where: {
        projectId_sharedEmail: {
          projectId: project.id,
          sharedEmail: email,
        },
      },
      create: {
        projectId: project.id,
        sharedEmail: email,
        permission: body.permission === 'edit' ? 'edit' : 'view',
      },
      update: {
        permission: body.permission === 'edit' ? 'edit' : 'view',
      },
    });
    return NextResponse.json({ share }, { status: 201 });
  }

  return NextResponse.json({ error: 'Invalid share action' }, { status: 400 });
}
