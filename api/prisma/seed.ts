import { PrismaClient, Role, UserStatus, Platform, InviteStatus, EventVisibility, GameRequestStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!@#', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@spacecityeidolons.com' },
    update: {},
    create: {
      email: 'admin@spacecityeidolons.com',
      password: adminPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          displayName: 'Admin User',
          bio: 'Community administrator',
          privacyProfile: false,
          privacyEvents: false,
        },
      },
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create test member
  const memberPassword = await bcrypt.hash('Member123!@#', 10);
  const member = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      email: 'member@example.com',
      password: memberPassword,
      role: Role.MEMBER,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          displayName: 'Test Member',
          bio: 'A test community member',
          twitchUrl: 'https://twitch.tv/testmember',
          gamesPlayed: ['D&D 5e', 'Pathfinder', 'Call of Cthulhu'],
          privacyProfile: false,
          privacyEvents: false,
        },
      },
    },
  });
  console.log('✅ Created member user:', member.email);

  // Create sample invite requests
  await prisma.inviteRequest.createMany({
    data: [
      {
        email: 'newcomer1@example.com',
        name: 'John Doe',
        platform: Platform.DISCORD,
        message: 'I love tabletop RPGs and would like to join!',
        status: InviteStatus.PENDING,
      },
      {
        email: 'newcomer2@example.com',
        name: 'Jane Smith',
        platform: Platform.MATRIX,
        message: 'Interested in joining game sessions',
        status: InviteStatus.APPROVED,
        adminNote: 'Approved by admin',
      },
    ],
  });
  console.log('✅ Created sample invite requests');

  // Create sample games
  await prisma.game.createMany({
    data: [
      {
        name: 'Dungeons & Dragons 5e',
        slug: 'dnd-5e',
        description: 'The world\'s greatest roleplaying game',
        content: '# D&D 5e\n\nWelcome to our D&D 5e community!',
        category: 'Tabletop RPG',
        tags: ['RPG', 'Fantasy', 'Dungeons & Dragons'],
      },
      {
        name: 'Pathfinder 2e',
        slug: 'pathfinder-2e',
        description: 'A fantasy tabletop roleplaying game',
        content: '# Pathfinder 2e\n\nExplore the world of Golarion!',
        category: 'Tabletop RPG',
        tags: ['RPG', 'Fantasy', 'Pathfinder'],
      },
      {
        name: 'Call of Cthulhu',
        slug: 'call-of-cthulhu',
        description: 'Horror roleplaying in the world of H.P. Lovecraft',
        content: '# Call of Cthulhu\n\nInvestigate cosmic horrors!',
        category: 'Tabletop RPG',
        tags: ['RPG', 'Horror', 'Lovecraft'],
      },
    ],
  });
  console.log('✅ Created sample games');

  // Create sample events
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.event.createMany({
    data: [
      {
        title: 'Weekly D&D Session',
        description: 'Our regular D&D campaign continues!',
        date: tomorrow,
        time: '19:00',
        duration: 240,
        location: 'Discord Voice Channel #1',
        visibility: EventVisibility.PUBLIC,
        maxAttendees: 6,
        tags: ['D&D', 'RPG', 'Regular Session'],
        creatorId: member.id,
      },
      {
        title: 'New Player Introduction',
        description: 'Introduction session for new members',
        date: nextWeek,
        time: '18:00',
        duration: 120,
        location: 'Discord Voice Channel #2',
        visibility: EventVisibility.PUBLIC,
        maxAttendees: 10,
        tags: ['Beginner Friendly', 'Introduction'],
        creatorId: admin.id,
      },
    ],
  });
  console.log('✅ Created sample events');

  // Create sample game page request
  await prisma.gamePageRequest.create({
    data: {
      requesterId: member.id,
      gameName: 'Vampire: The Masquerade',
      description: 'V5 edition of the classic World of Darkness game',
      reason: 'Several members are interested in starting a VtM campaign',
      status: GameRequestStatus.PENDING,
    },
  });
  console.log('✅ Created sample game page request');

  console.log('🌱 Database seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
