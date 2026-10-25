import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const shareLink = await prisma.projectShareLink.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!shareLink || !shareLink.isActive) {
    return NextResponse.json(
      { error: 'Share link is invalid or has been revoked.' },
      { status: 404 }
    );
  }

  if (shareLink.expiresAt && shareLink.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: 'Share link has expired.' }, { status: 410 });
  }

  return NextResponse.json({
    shareLink: {
      shareToken: shareLink.token,
      permission: 'view',
      createdAt: shareLink.createdAt,
    },
    project: {
      id: shareLink.project.id,
      name: shareLink.project.name,
      code: shareLink.project.code,
      cadEngine: 'replicad',
      parameters: shareLink.project.parameters,
      partColors: shareLink.project.renderConfigJson,
      ownerName: shareLink.project.user.name,
      updatedAt: shareLink.project.updatedAt,
    },
  });
}
