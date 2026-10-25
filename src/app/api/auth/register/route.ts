import { NextRequest, NextResponse } from 'next/server';
import { redeemInvitationAndRegisterUser } from '@/lib/invitations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'browser';

    const user = await redeemInvitationAndRegisterUser({
      invitationCode: String(body.invitationCode || ''),
      email: String(body.email || ''),
      name: String(body.name || ''),
      password: String(body.password || ''),
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          planTier: user.planTier,
          creditsBalance: user.creditsBalance,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed.';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
