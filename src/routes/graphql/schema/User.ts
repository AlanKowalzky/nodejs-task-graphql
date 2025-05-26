import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
import { User, Post, Profile } from '@prisma/client';
import { GraphQLContext } from '../context.js';
import { shouldIncludeSubscriptions } from '../loaders.js';

export const UserTypeResolvers = {
  id: (user: User) => user.id,
  name: (user: User) => user.name,
  balance: (user: User) => user.balance,
  posts: async (user: User, _: unknown, context: GraphQLContext) => {
    return context.prisma.post.findMany({
      where: { authorId: user.id },
    });
  },
  profile: async (user: User, _: unknown, context: GraphQLContext) => {
    return context.prisma.profile.findUnique({
      where: { userId: user.id },
    });
  },
  userSubscribedTo: async (user: User, _: unknown, context: GraphQLContext, info: GraphQLResolveInfo) => {
    if (!shouldIncludeSubscriptions(info)) {
      return [];
    }
    return context.prisma.user.findMany({
      where: {
        subscribedToUser: {
          some: {
            subscriberId: user.id,
          },
        },
      },
    });
  },
  subscribedToUser: async (user: User, _: unknown, context: GraphQLContext, info: GraphQLResolveInfo) => {
    if (!shouldIncludeSubscriptions(info)) {
      return [];
    }
    return context.prisma.user.findMany({
      where: {
        userSubscribedTo: {
          some: {
            authorId: user.id,
          },
        },
      },
    });
  },
};