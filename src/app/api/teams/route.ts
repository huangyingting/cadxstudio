import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { createdById: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    include: {
      members: {
        include: { user: { select: { email: true, name: true } } },
      },
      projects: {
        include: {
          sourceProject: true,
          submissions: {
            include: { comments: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ teams });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const team = await prisma.team.create({
    data: {
      name: String(body.name || 'Engineering Team'),
      description: body.description ? String(body.description) : '',
      createdById: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'owner',
        },
      },
    },
    include: {
      members: true,
      projects: true,
    },
  });

  return NextResponse.json({ team }, { status: 201 });
}
