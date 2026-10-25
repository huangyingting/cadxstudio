import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { listAuditLogs } from '@/lib/audit';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const logs = await listAuditLogs(150);
  return NextResponse.json({ logs });
}
