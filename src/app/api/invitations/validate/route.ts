import { NextRequest, NextResponse } from 'next/server';
import { validateInvitationCode } from '@/lib/invitations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await validateInvitationCode(
      String(body.code || ''),
      body.email ? String(body.email) : undefined
    );
    return NextResponse.json(result, { status: result.valid ? 200 : 400 });
  } catch (err) {
    return NextResponse.json(
      { valid: false, reason: err instanceof Error ? err.message : 'Validation failed' },
      { status: 400 }
    );
  }
}
