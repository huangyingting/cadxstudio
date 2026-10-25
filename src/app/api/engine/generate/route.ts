import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { executeReplicadScript, synthesizeCadFromPrompt } from '@/lib/cad-kernel';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const prompt = String(body.prompt || '').trim();
  const existingCode = body.existingCode ? String(body.existingCode) : undefined;
  const cadEngine = body.cadEngine === 'build123d' ? 'build123d' : 'replicad';

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.creditsBalance < 1) {
    return NextResponse.json(
      { error: 'Insufficient AI credits. Please upgrade your plan.' },
      { status: 402 }
    );
  }

  const synthesized = synthesizeCadFromPrompt(prompt, existingCode);
  const compiled = executeReplicadScript(synthesized.code);

  const inputTokens = Math.max(120, prompt.length * 4);
  const outputTokens = Math.max(380, synthesized.code.length * 2);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { creditsBalance: { decrement: 1 } },
    }),
    prisma.tokenUsage.create({
      data: {
        userId: user.id,
        operation: prompt.slice(0, 140),
        model: cadEngine,
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        creditsDeducted: 1,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    name: synthesized.name,
    code: synthesized.code,
    explanation: synthesized.explanation,
    compiled,
    creditsRemaining: dbUser.creditsBalance - 1,
  });
}
