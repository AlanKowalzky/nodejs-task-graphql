import DataLoader from 'dataloader';
import { PrismaClient, User, SubscribersOnAuthors, Post, Profile, MemberType } from '@prisma/client';
import { parseResolveInfo, ResolveTree, FieldsByTypeName } from 'graphql-parse-resolve-info';
import { GraphQLResolveInfo } from 'graphql';

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
        authorId: { in: Array.from(ids) },
      },
    });

    const postsByAuthorId = new Map<string, Post[]>();
    // Initialize map for all requested author IDs
    for (const id of ids) {
      postsByAuthorId.set(id, []);
    }
    // Group posts by authorId
    for (const post of posts) {
      postsByAuthorId.get(post.authorId)?.push(post);
    }

    return ids.map((id) => postsByAuthorId.get(id)!); // '!' is safe due to pre-initialization
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
        subscriberId: { in: Array.from(ids) },
      },
      include: {
        author: true,
      },
    });

    const subscriptionsBySubscriberId = new Map<string, User[]>();
    // Initialize map for all requested subscriber IDs
    for (const id of ids) {
      subscriptionsBySubscriberId.set(id, []);
    }

    // Group subscribed authors by subscriberId
    for (const sub of subscriptions) {
      if (sub.author) { // Ensure author is not null
        const userAuthors = subscriptionsBySubscriberId.get(sub.subscriberId);
        if (userAuthors) {
          userAuthors.push(sub.author);
          userLoader.prime(sub.author.id, sub.author); // Prime userLoader with the author
        }
      }
    }
    return ids.map((id) => subscriptionsBySubscriberId.get(id)!);
  });

  const userSubscribersLoader = new DataLoader<string, User[]>(async (ids: readonly string[]) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: {
        authorId: {
          in: Array.from(ids) },
      },
      include: {
        subscriber: true,
      },
    });

    const subscribersByAuthorId = new Map<string, User[]>();
    // Initialize map for all requested author IDs
    for (const id of ids) {
      subscribersByAuthorId.set(id, []);
    }

    // Group subscribers by authorId
    for (const sub of subscriptions) {
      if (sub.subscriber) { // Ensure subscriber is not null
        const authorSubscribers = subscribersByAuthorId.get(sub.authorId);
        if (authorSubscribers) {
          authorSubscribers.push(sub.subscriber);
          userLoader.prime(sub.subscriber.id, sub.subscriber); // Prime userLoader with the subscriber
        }
      }
    }
    return ids.map((id) => subscribersByAuthorId.get(id)!);
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

export const shouldIncludeSubscriptions = (info: GraphQLResolveInfo): boolean => {
  const parsedInfo = parseResolveInfo(info);
  if (!parsedInfo) {
    return false; // Or handle error appropriately
  }
  const userFields = (parsedInfo.fieldsByTypeName as FieldsByTypeName).User || {};
  return 'userSubscribedTo' in userFields || 'subscribedToUser' in userFields;
};