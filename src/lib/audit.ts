import { prisma } from './prisma';

export interface AuditLogInput {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function writeAuditLog(input: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        actorEmail: input.actorEmail ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        details: JSON.stringify(input.details ?? {}),
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit entry:', err);
    return null;
  }
}

export async function listAuditLogs(limit = 100) {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      actor: {
        select: { id: true, email: true, name: true, role: true },
      },
    },
  });
  return logs.map((l) => ({
    ...l,
    parsedDetails: (() => {
      try {
        return JSON.parse(l.details || '{}');
      } catch {
        return {};
      }
    })(),
  }));
}
