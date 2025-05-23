import { MemberType, PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

const memberTypes: MemberType[] = [
  { id: 'BASIC', postsLimitPerMonth: 10, discount: 2.3 },
  { id: 'BUSINESS', postsLimitPerMonth: 100, discount: 7.7 },
];

const users: User[] = [
  { id: '1', name: 'Test User', balance: 100.0 },
];

async function seed() {
  for (const memberType of memberTypes) {
    await prisma.memberType.create({
      data: memberType,
    });
  }

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
