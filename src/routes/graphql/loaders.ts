import DataLoader from 'dataloader';
import { PrismaClient, User, SubscribersOnAuthors, Post, Profile, MemberType } from '@prisma/client';
import { parseResolveInfo, ResolveTree } from 'graphql-parse-resolve-info';

type SubscribersOnAuthorsWithRelations = SubscribersOnAuthors & {
  author: User;
  subscriber: User;
};

export const createLoaders = (prisma: PrismaClient) => {
  const userLoader = new DataLoader<string, User | null>(async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: Array.from(ids),
        },
      },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));
    return ids.map((id) => userMap.get(id) || null);
  });

  const postLoader = new DataLoader<string, Post[]>(async (ids: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: {
        authorId: {
          in: Array.from(ids),
        },
      },
    });

    const postMap = new Map<string, Post[]>();
    ids.forEach((id) => {
      postMap.set(
        id,
        posts.filter((post) => post.authorId === id)
      );
    });

    return ids.map((id) => postMap.get(id) || []);
  });

  const profileLoader = new DataLoader<string, Profile | null>(async (ids: readonly string[]) => {
    const profiles = await prisma.profile.findMany({
      where: {
        userId: {
          in: Array.from(ids),
        },
      },
    });

    const profileMap = new Map(profiles.map((profile) => [profile.userId, profile]));
    return ids.map((id) => profileMap.get(id) || null);
  });

  const memberTypeLoader = new DataLoader<string, MemberType | null>(async (ids: readonly string[]) => {
    const memberTypes = await prisma.memberType.findMany({
      where: {
        id: {
          in: Array.from(ids),
        },
      },
    });

    const memberTypeMap = new Map(memberTypes.map((memberType) => [memberType.id, memberType]));
    return ids.map((id) => memberTypeMap.get(id) || null);
  });

  const userSubscriptionsLoader = new DataLoader<string, User[]>(async (ids: readonly string[]) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: {
        subscriberId: {
          in: Array.from(ids),
        },
      },
    });

    const authorIds = subscriptions.map(sub => sub.authorId);
    const authors = await prisma.user.findMany({
      where: {
        id: {
          in: authorIds,
        },
      },
    });

    const authorMap = new Map(authors.map(author => [author.id, author]));
    const subscriptionMap = new Map<string, User[]>();
    ids.forEach((id) => {
      const userSubscriptions = subscriptions
        .filter((sub) => sub.subscriberId === id)
        .map((sub) => authorMap.get(sub.authorId)!);
      subscriptionMap.set(id, userSubscriptions);
    });

    return ids.map((id) => subscriptionMap.get(id) || []);
  });

  const userSubscribersLoader = new DataLoader<string, User[]>(async (ids: readonly string[]) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: {
        authorId: {
          in: Array.from(ids),
        },
      },
    });

    const subscriberIds = subscriptions.map(sub => sub.subscriberId);
    const subscribers = await prisma.user.findMany({
      where: {
        id: {
          in: subscriberIds,
        },
      },
    });

    const subscriberMap = new Map(subscribers.map(subscriber => [subscriber.id, subscriber]));
    const subscriberListMap = new Map<string, User[]>();
    ids.forEach((id) => {
      const userSubscribers = subscriptions
        .filter((sub) => sub.authorId === id)
        .map((sub) => subscriberMap.get(sub.subscriberId)!);
      subscriberListMap.set(id, userSubscribers);
    });

    return ids.map((id) => subscriberListMap.get(id) || []);
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

export const shouldIncludeSubscriptions = (info: any): boolean => {
  const parsedInfo = parseResolveInfo(info) as ResolveTree;
  const userFields = parsedInfo.fieldsByTypeName.User || {};
  return 'userSubscribedTo' in userFields || 'subscribedToUser' in userFields;
};