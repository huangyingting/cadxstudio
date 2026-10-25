import { readFileSync } from 'node:fs';
import { bootstrapAdminAccount } from '../src/lib/invitations';

function loadLocalEnv(): void {
  for (const envFile of ['.env.local', '.env']) {
    try {
      process.loadEnvFile?.(envFile);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

function parseArgs(argv: string[]) {
  let email = process.env.BOOTSTRAP_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '';
  let name = process.env.BOOTSTRAP_ADMIN_NAME || process.env.ADMIN_NAME || 'CADx Platform Admin';
  let password = process.env.BOOTSTRAP_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
  let inviteCode = process.env.BOOTSTRAP_INVITE_CODE || '';
  let passwordStdin = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--email' && argv[i + 1]) email = argv[++i];
    else if (arg.startsWith('--email=')) email = arg.slice('--email='.length);
    else if (arg === '--name' && argv[i + 1]) name = argv[++i];
    else if (arg.startsWith('--name=')) name = arg.slice('--name='.length);
    else if (arg === '--password' && argv[i + 1]) password = argv[++i];
    else if (arg.startsWith('--password=')) password = arg.slice('--password='.length);
    else if (arg === '--invite-code' && argv[i + 1]) inviteCode = argv[++i];
    else if (arg.startsWith('--invite-code=')) inviteCode = arg.slice('--invite-code='.length);
    else if (arg === '--password-stdin') passwordStdin = true;
  }

  return { email, name, password, inviteCode, passwordStdin };
}

async function main() {
  loadLocalEnv();
  const args = parseArgs(process.argv.slice(2));
  const password = args.passwordStdin
    ? readFileSync(0, 'utf8').replace(/\r?\n$/, '')
    : args.password;

  if (!args.email || !password) {
    console.error(
      'Usage: npm run bootstrap:admin -- --email <admin@domain.com> --password <password> [--name <name>] [--invite-code <code>]'
    );
    process.exit(2);
  }

  const result = await bootstrapAdminAccount({
    email: args.email,
    password,
    name: args.name,
    inviteCode: args.inviteCode || undefined,
  });

  console.log(
    JSON.stringify({
      ok: true,
      created: result.created,
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      invitationCode: result.invitation?.code ?? null,
    })
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
