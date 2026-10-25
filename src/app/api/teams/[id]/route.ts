import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id: teamId } = await context.params;
  const body = await req.json();

  if (body.action === 'add_member' && body.email) {
    const email = String(body.email).trim().toLowerCase();
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const member = await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId, userId: targetUser.id } },
      create: {
        teamId,
        userId: targetUser.id,
        role: body.role || 'editor',
      },
      update: {
        role: body.role || 'editor',
      },
    });
    return NextResponse.json({ member }, { status: 201 });
  }

  if (body.action === 'share_project' && body.projectId) {
    const srcProj = await prisma.designProject.findUnique({
      where: { id: String(body.projectId) },
    });
    if (!srcProj) {
      return NextResponse.json({ error: 'Source project not found' }, { status: 404 });
    }
    const tp = await prisma.teamProject.create({
      data: {
        teamId,
        sourceProjectId: srcProj.id,
        sharedById: user.id,
        name: srcProj.name,
        code: srcProj.code,
        parameters: srcProj.parameters,
      },
      include: { sourceProject: true },
    });
    return NextResponse.json({ teamProject: tp }, { status: 201 });
  }

  if (body.action === 'submit_changes' && body.teamProjectId) {
    const submission = await prisma.teamProjectSubmission.create({
      data: {
        teamProjectId: String(body.teamProjectId),
        submittedById: user.id,
        title: String(body.title || 'Proposed Geometry Update'),
        description: body.description ? String(body.description) : '',
        proposedCode: String(body.codeSnapshot || ''),
        status: 'pending',
      },
    });
    return NextResponse.json({ submission }, { status: 201 });
  }

  if (body.action === 'review_submission' && body.submissionId) {
    const status = body.status === 'accepted' ? 'accepted' : 'rejected';
    const submission = await prisma.teamProjectSubmission.update({
      where: { id: String(body.submissionId) },
      data: {
        status,
      },
      include: { teamProject: true },
    });

    if (status === 'accepted' && submission.proposedCode) {
      await prisma.teamProject.update({
        where: { id: submission.teamProjectId },
        data: { code: submission.proposedCode },
      });
    }

    return NextResponse.json({ submission });
  }

  return NextResponse.json({ error: 'Invalid team action' }, { status: 400 });
}
