import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inquiry = await prisma.leadInquiry.create({
      data: {
        type: String(body.inquiryType || 'enterprise'),
        name: String(body.name || ''),
        email: String(body.email || ''),
        company: body.company ? String(body.company) : '',
        role: body.roleTitle ? String(body.roleTitle) : '',
        payloadJson: JSON.stringify({
          teamSize: body.teamSize || null,
          useCase: body.useCase || null,
          expectedVolume: body.expectedVolume || null,
          message: body.message || null,
        }),
      },
    });
    return NextResponse.json({ ok: true, inquiry }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Submission failed' },
      { status: 400 }
    );
  }
}
