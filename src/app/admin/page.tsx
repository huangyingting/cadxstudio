'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import {
  Shield,
  KeyRound,
  Users,
  FileText,
  Plus,
  Ban,
  Copy,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface InvitationItem {
  id: string;
  code: string;
  email: string | null;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  status: 'ACTIVE' | 'USED' | 'REVOKED' | 'EXPIRED';
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  note: string | null;
  createdAt: string;
}

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  planTier: string;
  creditsBalance: number;
  isActive: boolean;
  createdAt: string;
  _count: { projects: number };
}

interface AuditLogItem {
  id: string;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AdminGovernancePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'invitations' | 'users' | 'audit'>('invitations');

  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New invitation form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [inviteMaxUses, setInviteMaxUses] = useState(1);
  const [inviteExpiresHours, setInviteExpiresHours] = useState(72);
  const [inviteNote, setInviteNote] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);

  const loadGovernanceData = async () => {
    const [invRes, usrRes, audRes] = await Promise.all([
      fetch('/api/admin/invitations'),
      fetch('/api/admin/users'),
      fetch('/api/admin/audit-logs'),
    ]);
    if (invRes.ok) {
      const d = await invRes.json();
      setInvitations(d.invitations || []);
    }
    if (usrRes.ok) {
      const d = await usrRes.json();
      setUsers(d.users || []);
    }
    if (audRes.ok) {
      const d = await audRes.json();
      setAuditLogs(d.logs || []);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      loadGovernanceData();
    }
  }, [session]);

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingInvite(true);
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim() || null,
          role: inviteRole,
          maxUses: inviteMaxUses,
          expiresInHours: inviteExpiresHours,
          note: inviteNote.trim() || null,
        }),
      });
      if (res.ok) {
        setInviteEmail('');
        setInviteNote('');
        await loadGovernanceData();
      }
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    await fetch('/api/admin/invitations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId }),
    });
    await loadGovernanceData();
  };

  const handleUpdateUser = async (userId: string, patch: Record<string, unknown>) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...patch }),
    });
    await loadGovernanceData();
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center text-xs text-zinc-400">
          Loading Governance Portal...
        </main>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center space-y-3">
            <Shield className="h-8 w-8 text-red-400 mx-auto" />
            <h1 className="text-xl font-bold text-white">Administrator Access Required</h1>
            <p className="text-xs text-zinc-300">
              Only accounts with the <code className="text-amber-300">ADMIN</code> role can issue
              or revoke invitation codes and inspect security audit logs.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Shield className="h-4 w-4" />
                <span>Invite-Only Access Control &amp; Security Audit</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white">
                CadxStudio Admin Governance Portal
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('invitations')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'invitations'
                    ? 'bg-sky-500 text-slate-950'
                    : 'border border-white/10 bg-[#0d1017] text-zinc-300 hover:text-white'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                Invitations ({invitations.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'users'
                    ? 'bg-sky-500 text-slate-950'
                    : 'border border-white/10 bg-[#0d1017] text-zinc-300 hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Users &amp; Roles ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'audit'
                    ? 'bg-sky-500 text-slate-950'
                    : 'border border-white/10 bg-[#0d1017] text-zinc-300 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Audit Logs ({auditLogs.length})
              </button>
              <button
                type="button"
                onClick={loadGovernanceData}
                aria-label="Refresh Governance Data"
                className="rounded-xl border border-white/10 bg-[#0d1017] p-2 text-zinc-400 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* TAB 1: INVITATIONS */}
          {activeTab === 'invitations' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <form
                  onSubmit={handleCreateInvitation}
                  className="rounded-2xl border border-white/10 bg-[#0d1017] p-6 space-y-4"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Plus className="h-4 w-4 text-sky-400" />
                    <span>Generate Invitation Code</span>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Target Email (optional lock)
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Leave blank for any recipient"
                      className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Assigned Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) =>
                          setInviteRole(e.target.value as 'ADMIN' | 'MEMBER' | 'VIEWER')
                        }
                        className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white"
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Max Redemptions</label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={inviteMaxUses}
                        onChange={(e) => setInviteMaxUses(Number(e.target.value))}
                        className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Expires In (Hours)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={8760}
                      value={inviteExpiresHours}
                      onChange={(e) => setInviteExpiresHours(Number(e.target.value))}
                      className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Audit Note</label>
                    <input
                      value={inviteNote}
                      onChange={(e) => setInviteNote(e.target.value)}
                      placeholder="e.g., Robotics Team Onboarding"
                      className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creatingInvite}
                    className="w-full rounded-xl bg-sky-500 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition"
                  >
                    {creatingInvite ? 'Issuing Code...' : 'Issue Invitation Code'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-8">
                <div className="rounded-2xl border border-white/10 bg-[#0d1017] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-white/10 bg-slate-950/70 text-[11px] uppercase text-zinc-400">
                        <tr>
                          <th className="px-4 py-3">Invitation Code</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Uses</th>
                          <th className="px-4 py-3">Expires</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {invitations.map((inv) => (
                          <tr key={inv.id} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-mono font-bold text-amber-300">
                              <div>{inv.code}</div>
                              {inv.email && (
                                <div className="text-[10px] font-sans text-zinc-400">
                                  Locked: {inv.email}
                                </div>
                              )}
                              {inv.note && (
                                <div className="text-[10px] font-sans text-zinc-500">{inv.note}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-200">
                                {inv.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  inv.status === 'ACTIVE'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : inv.status === 'USED'
                                      ? 'bg-sky-500/20 text-sky-300'
                                      : 'bg-red-500/20 text-red-300'
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-zinc-300">
                              {inv.usedCount} / {inv.maxUses}
                            </td>
                            <td className="px-4 py-3 text-zinc-400">
                              {new Date(inv.expiresAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(inv.code);
                                  setCopiedId(inv.id);
                                  setTimeout(() => setCopiedId(null), 1500);
                                }}
                                className="inline-flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-[11px] text-zinc-300 hover:bg-white/10"
                              >
                                {copiedId === inv.id ? (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                                Copy
                              </button>
                              {inv.status === 'ACTIVE' && (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeInvitation(inv.id)}
                                  className="inline-flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] text-red-300 hover:bg-red-500/20"
                                >
                                  <Ban className="h-3 w-3" />
                                  Revoke
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS & ROLES */}
          {activeTab === 'users' && (
            <div className="rounded-2xl border border-white/10 bg-[#0d1017] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-slate-950/70 text-[11px] uppercase text-zinc-400">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Credits</th>
                      <th className="px-4 py-3">Projects</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-zinc-400">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                            className="rounded border border-white/15 bg-slate-950 px-2 py-1 text-xs text-white"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="MEMBER">MEMBER</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 uppercase font-mono text-sky-400">{u.planTier}</td>
                        <td className="px-4 py-3 font-mono text-amber-300">
                          {u.creditsBalance}
                        </td>
                        <td className="px-4 py-3 font-mono">{u._count.projects}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleUpdateUser(u.id, { isActive: !u.isActive })}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              u.isActive
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="rounded-2xl border border-white/10 bg-[#0d1017] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-slate-950/70 text-[11px] uppercase text-zinc-400">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-sky-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-300">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-300">{log.actorEmail || 'system'}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">
                          {log.targetType}:{log.targetId?.slice(0, 10)}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400 max-w-md truncate">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
