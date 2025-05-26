import DataLoader from 'dataloader';
import { PrismaClient, User, Post, Profile, MemberType } from '@prisma/client';
import { parseResolveInfo, ResolveTree } from 'graphql-parse-resolve-info';

export const shouldIncludeSubscriptions = () => {
  return process.env.INCLUDE_SUBSCRIPTIONS === 'true';
};

export const createLoaders = (prisma: PrismaClient) => {
  const userLoader = new DataLoader<string, User | null>(async (ids) => {
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
    });
    return ids.map((id) => users.find((user) => user.id === id) || null);
  });

  const postLoader = new DataLoader<string, Post[]>(async (ids) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: ids as string[] } },
    });
    return ids.map((id) => posts.filter((post) => post.authorId === id));
  });

  const profileLoader = new DataLoader<string, Profile | null>(async (ids) => {
    const profiles = await prisma.profile.findMany({
      where: { id: { in: ids as string[] } },
    });
    return ids.map((id) => profiles.find((profile) => profile.id === id) || null);
  });

  const memberTypeLoader = new DataLoader<string, MemberType | null>(async (ids) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: ids as string[] } },
    });
    return ids.map((id) => memberTypes.find((memberType) => memberType.id === id) || null);
  });

  const userSubscriptionsLoader = new DataLoader<string, User[]>(async (ids) => {
    const subscriptions = await prisma.user.findMany({
      where: {
        subscribedToUser: {
          some: {
            subscriberId: { in: ids as string[] },
          },
        },
      },
    });
    return ids.map((id) => subscriptions.filter((user) => user.id === id));
  });

  const userSubscribersLoader = new DataLoader<string, User[]>(async (ids) => {
    const subscribers = await prisma.user.findMany({
      where: {
        userSubscribedTo: {
          some: {
            authorId: { in: ids as string[] },
          },
        },
      },
    });
    return ids.map((id) => subscribers.filter((user) => user.id === id));
  });

  return {
    userLoader,
    postLoader,
    profileLoader,
    memberTypeLoader,
    userSubscriptionsLoader,
    userSubscribersLoader,
  };
};