import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [ownedProjects, sharedProjects] = await Promise.all([
    prisma.designProject.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        shareLinks: { where: { isActive: true } },
        shares: true,
      },
    }),
    prisma.projectShare.findMany({
      where: { sharedEmail: user.email },
      include: {
        project: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    }),
  ]);

  return NextResponse.json({
    ownedProjects,
    sharedProjects,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const project = await prisma.designProject.create({
    data: {
      userId: user.id,
      name: String(body.name || 'Untitled Project'),
      code: String(body.code || ''),
      messages: JSON.stringify(body.messages || []),
      parameters: JSON.stringify(body.parameters || {}),
      moodboardJson: JSON.stringify({
        cadEngine: body.cadEngine || 'replicad',
        annotations: body.annotations || [],
      }),
      renderConfigJson: JSON.stringify(body.partColors || {}),
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
