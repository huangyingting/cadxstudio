import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { writeAuditLog } from './audit';
import { normalizeEmail } from './invitations';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email || '');
        const password = credentials?.password || '';
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
          await writeAuditLog({
            actorEmail: email,
            action: 'USER_LOGIN_FAILED',
            targetType: 'User',
            details: { reason: !user ? 'user_not_found' : 'account_disabled' },
          });
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          await writeAuditLog({
            actorId: user.id,
            actorEmail: user.email,
            action: 'USER_LOGIN_FAILED',
            targetType: 'User',
            targetId: user.id,
            details: { reason: 'invalid_password' },
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        await writeAuditLog({
          actorId: user.id,
          actorEmail: user.email,
          action: 'USER_LOGGED_IN',
          targetType: 'User',
          targetId: user.id,
          details: { role: user.role, planTier: user.planTier },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          planTier: user.planTier,
          creditsBalance: user.creditsBalance,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'MEMBER';
        token.planTier = (user as { planTier?: string }).planTier ?? 'pro';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            planTier: true,
            creditsBalance: true,
            themeMode: true,
            onboardingDone: true,
            isActive: true,
          },
        });
        if (dbUser && dbUser.isActive) {
          (session.user as Record<string, unknown>).id = dbUser.id;
          (session.user as Record<string, unknown>).role = dbUser.role;
          (session.user as Record<string, unknown>).planTier = dbUser.planTier;
          (session.user as Record<string, unknown>).creditsBalance = dbUser.creditsBalance;
          (session.user as Record<string, unknown>).themeMode = dbUser.themeMode;
          (session.user as Record<string, unknown>).onboardingDone = dbUser.onboardingDone;
        } else {
          (session.user as Record<string, unknown>).id = String(token.id);
          (session.user as Record<string, unknown>).role = String(token.role || 'MEMBER');
          (session.user as Record<string, unknown>).planTier = String(token.planTier || 'pro');
        }
      }
      return session;
    },
  },
};

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ENGINEER' | 'MEMBER' | 'VIEWER';
  planTier: string;
  creditsBalance: number;
  themeMode?: string;
  onboardingDone?: boolean;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const u = session.user as unknown as SessionUser;
  if (!u.id) return null;
  return u;
}
