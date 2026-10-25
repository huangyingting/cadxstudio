import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [dbUser, tokenUsage, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        planTier: true,
        creditsBalance: true,
        themeMode: true,
        onboardingDone: true,
        createdAt: true,
      },
    }),
    prisma.tokenUsage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.paymentTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
  ]);

  return NextResponse.json({
    profile: dbUser,
    tokenUsage,
    transactions,
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();
  if (typeof body.themeMode === 'string') data.themeMode = body.themeMode;
  if (typeof body.onboardingDone === 'boolean') data.onboardingDone = body.onboardingDone;
  if (typeof body.planTier === 'string') {
    data.planTier = body.planTier;
    const creditsToAdd = body.planTier === 'starter' ? 30 : body.planTier === 'pro' ? 200 : 400;
    const amountCents = body.planTier === 'starter' ? 200 : body.planTier === 'pro' ? 2000 : 4900;
    const current = await prisma.user.findUnique({ where: { id: user.id } });
    data.creditsBalance = (current?.creditsBalance ?? 0) + creditsToAdd;

    await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        planId: body.planTier,
        description: `Plan Upgrade: ${body.planTier.toUpperCase()} (+${creditsToAdd} Credits)`,
        amountCents,
        creditsAdded: creditsToAdd,
        status: 'succeeded',
      },
    });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      planTier: true,
      creditsBalance: true,
      themeMode: true,
      onboardingDone: true,
    },
  });

  return NextResponse.json({ profile: updated });
}
