import { FastifyInstance } from 'fastify';
import { GraphQLResolveInfo } from 'graphql';
import { PrismaClient, User, Post, Profile, MemberType, SubscribersOnAuthors } from '@prisma/client';
import DataLoader from 'dataloader';
import { parseResolveInfo, ResolveTree } from 'graphql-parse-resolve-info';

type UserWithRelations = User & {
  userSubscribedTo: (SubscribersOnAuthors & {
    author: User;
  })[];
  subscribedToUser: (SubscribersOnAuthors & {
    subscriber: User;
  })[];
};

type ProfileWithRelations = Profile & {
  memberType: MemberType;
};

export const shouldIncludeSubscriptions = () => {
  return process.env.INCLUDE_SUBSCRIPTIONS === 'true';
};

const shouldIncludeField = (info: GraphQLResolveInfo, fieldName: string): boolean => {
  const parsedInfo = parseResolveInfo(info) as ResolveTree;
  return fieldName in parsedInfo.fieldsByTypeName;
};

export const createLoaders = (prisma: PrismaClient) => {
  const userLoader = new DataLoader<string, UserWithRelations | null>(async (ids) => {
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
      include: {
        userSubscribedTo: {
          include: {
            author: true
          }
        },
        subscribedToUser: {
          include: {
            subscriber: true
          }
        },
      },
    });
    return ids.map((id) => users.find((user) => user.id === id) || null);
  });

  const postLoader = new DataLoader<string, Post[]>(async (ids) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: ids as string[] } },
    });
    return ids.map((id) => posts.filter((post) => post.authorId === id));
  });

  const profileLoader = new DataLoader<string, ProfileWithRelations | null>(async (ids) => {
    const profiles = await prisma.profile.findMany({
      where: { id: { in: ids as string[] } },
      include: {
        memberType: true,
      },
    });
    return ids.map((id) => profiles.find((profile) => profile.id === id) || null);
  });

  const memberTypeLoader = new DataLoader<string, MemberType | null>(async (ids) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: ids as string[] } },
    });
    return ids.map((id) => memberTypes.find((memberType) => memberType.id === id) || null);
  });

  return {
    userLoader,
    postLoader,
    profileLoader,
    memberTypeLoader,
  };
};

export const createResolvers = (fastify: FastifyInstance) => {
  const { prisma } = fastify;
  const loaders = createLoaders(prisma);

  return {
    Query: {
      memberTypes: async () => {
        return await prisma.memberType.findMany();
      },
      memberType: async (_: unknown, { id }: { id: string }) => {
        return await loaders.memberTypeLoader.load(id);
      },
      users: async () => {
        return await prisma.user.findMany({
          include: {
            userSubscribedTo: {
              include: {
                author: true
              }
            },
            subscribedToUser: {
              include: {
                subscriber: true
              }
            },
          },
        });
      },
      user: async (_: unknown, { id }: { id: string }) => {
        return await loaders.userLoader.load(id);
      },
      posts: async () => {
        return await prisma.post.findMany();
      },
      post: async (_: unknown, { id }: { id: string }) => {
        return await prisma.post.findUnique({
          where: { id },
        });
      },
      profiles: async () => {
        return await prisma.profile.findMany({
          include: {
            memberType: true,
          },
        });
      },
      profile: async (_: unknown, { id }: { id: string }) => {
        return await loaders.profileLoader.load(id);
      },
    },
    User: {
      profile: async (parent: UserWithRelations) => {
        return await prisma.profile.findUnique({
          where: { userId: parent.id },
        });
      },
      posts: async (parent: UserWithRelations) => {
        return await loaders.postLoader.load(parent.id);
      },
      userSubscribedTo: async (parent: UserWithRelations, _: unknown, __: unknown, info: GraphQLResolveInfo) => {
        if (!shouldIncludeSubscriptions() || !shouldIncludeField(info, 'userSubscribedTo')) {
          return [];
        }
        const user = await loaders.userLoader.load(parent.id);
        return user?.userSubscribedTo.map(sub => sub.author) || [];
      },
      subscribedToUser: async (parent: UserWithRelations, _: unknown, __: unknown, info: GraphQLResolveInfo) => {
        if (!shouldIncludeSubscriptions() || !shouldIncludeField(info, 'subscribedToUser')) {
          return [];
        }
        const user = await loaders.userLoader.load(parent.id);
        return user?.subscribedToUser.map(sub => sub.subscriber) || [];
      },
    },
    Profile: {
      memberType: async (parent: Profile) => {
        const profile = await loaders.profileLoader.load(parent.id);
        return profile?.memberType;
      },
    },
  };
};