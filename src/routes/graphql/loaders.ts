import DataLoader from 'dataloader';
import { PrismaClient, User, SubscribersOnAuthors } from '@prisma/client';
import { parseResolveInfo, ResolveTree } from 'graphql-parse-resolve-info';

export const createLoaders = (prisma: PrismaClient) => {
  const userLoader = new DataLoader<string, User | null>(async (ids) => {
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: [...ids],
        },
      },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));
    return ids.map((id) => userMap.get(id) || null);
  });

  const userSubscriptionsLoader = new DataLoader<string, User[]>(async (ids) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: {
        subscriberId: {
          in: [...ids],
        },
      },
      include: {
        author: true,
      },
    });

    const subscriptionMap = new Map<string, User[]>();
    ids.forEach((id) => {
      subscriptionMap.set(
        id,
        subscriptions
          .filter((sub) => sub.subscriberId === id)
          .map((sub) => (sub as SubscribersOnAuthors & { author: User }).author)
      );
    });

    return ids.map((id) => subscriptionMap.get(id) || []);
  });

  const userSubscribersLoader = new DataLoader<string, User[]>(async (ids) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: {
        authorId: {
          in: [...ids],
        },
      },
      include: {
        subscriber: true,
      },
    });

    const subscriberMap = new Map<string, User[]>();
    ids.forEach((id) => {
      subscriberMap.set(
        id,
        subscriptions
          .filter((sub) => sub.authorId === id)
          .map((sub) => (sub as SubscribersOnAuthors & { subscriber: User }).subscriber)
      );
    });

    return ids.map((id) => subscriberMap.get(id) || []);
  });

  return {
    userLoader,
    userSubscriptionsLoader,
    userSubscribersLoader,
  };
};

export const shouldIncludeSubscriptions = (info: any): boolean => {
  const parsedInfo = parseResolveInfo(info) as ResolveTree;
  return (
    parsedInfo.fieldsByTypeName.User?.userSubscribedTo !== undefined ||
    parsedInfo.fieldsByTypeName.User?.subscribedToUser !== undefined
  );
};