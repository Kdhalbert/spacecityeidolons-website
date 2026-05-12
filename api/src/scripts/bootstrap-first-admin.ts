import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

interface CliArgs {
  userId?: string;
  email?: string;
  discordId?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === '--userId' && next) {
      args.userId = next;
      i += 1;
    } else if (current === '--email' && next) {
      args.email = next;
      i += 1;
    } else if (current === '--discordId' && next) {
      args.discordId = next;
      i += 1;
    }
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.userId && !args.email && !args.discordId) {
    throw new Error(
      'Provide one selector: --userId <id> OR --email <email> OR --discordId <discordId>'
    );
  }

  const existingAdminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
  if (existingAdminCount > 0) {
    throw new Error(
      'Bootstrap blocked: at least one ADMIN already exists. Use the admin panel/endpoint to promote additional admins.'
    );
  }

  const where = args.userId
    ? { id: args.userId }
    : args.email
      ? { email: args.email }
      : { discordId: args.discordId as string };

  const target = await prisma.user.findUnique({ where });
  if (!target) {
    throw new Error('No matching user found for the provided selector.');
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { role: Role.ADMIN },
    select: {
      id: true,
      email: true,
      discordId: true,
      discordUsername: true,
      role: true,
      updatedAt: true,
    },
  });

  console.log('First admin promoted successfully:');
  console.log(JSON.stringify(updated, null, 2));
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to bootstrap first admin: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
