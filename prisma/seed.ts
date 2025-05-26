import { MemberType, PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

const memberTypes: MemberType[] = [
  { id: 'BASIC', postsLimitPerMonth: 10, discount: 2.3 },
  { id: 'BUSINESS', postsLimitPerMonth: 100, discount: 7.7 },
];

const users: User[] = [
  { id: '1', name: 'Test User 1', balance: 100.0 },
  { id: '2', name: 'Test User 2', balance: 200.0 },
  { id: '3', name: 'Test User 3', balance: 300.0 },
];

async function seed() {
  // Tworzenie typów członkostwa
  for (const memberType of memberTypes) {
    await prisma.memberType.create({
      data: memberType,
    });
  }

  // Tworzenie użytkowników
  for (const user of users) {
    await prisma.user.create({
      data: {
        ...user,
        profile: {
          create: {
            isMale: true,
            yearOfBirth: 1990,
            memberTypeId: 'BASIC'
          }
        },
        posts: {
          create: {
            title: `Post by ${user.name}`,
            content: `Content of post by ${user.name}`
          }
        }
      }
    });
  }

  // Tworzenie subskrypcji
  await prisma.subscribersOnAuthors.create({
    data: {
      subscriberId: '1',
      authorId: '2'
    }
  });

  await prisma.subscribersOnAuthors.create({
    data: {
      subscriberId: '2',
      authorId: '3'
    }
  });

  await prisma.subscribersOnAuthors.create({
    data: {
      subscriberId: '3',
      authorId: '1'
    }
  });

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});