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
      shareLinks: { where: { isActive: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const hasAccess =
    project.userId === user.id ||
    user.role === 'ADMIN' ||
    project.shares.some((s) => s.sharedEmail.toLowerCase() === user.email.toLowerCase());

  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  const existing = await prisma.designProject.findUnique({
    where: { id },
    include: { shares: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const canEdit =
    existing.userId === user.id ||
    user.role === 'ADMIN' ||
    existing.shares.some(
      (s) => s.sharedEmail.toLowerCase() === user.email.toLowerCase() && s.permission === 'edit'
    );

  if (!canEdit) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === 'string') data.name = body.name;
  if (typeof body.code === 'string') data.code = body.code;
  if (body.messages !== undefined) data.messages = JSON.stringify(body.messages);
  if (body.parameters !== undefined) data.parameters = JSON.stringify(body.parameters);
  if (body.partColors !== undefined) data.renderConfigJson = JSON.stringify(body.partColors);

  const updated = await prisma.designProject.update({
    where: { id },
    data,
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  const existing = await prisma.designProject.findUnique({ where: { id } });
  if (!existing || (existing.userId !== user.id && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.designProject.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
