import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
import { User, Post, Profile } from '@prisma/client';
import { GraphQLContext } from '../context.js';
import { shouldIncludeSubscriptions } from '../loaders.js';
import { UserTypeGQL, PostTypeGQL, ProfileTypeGQL } from './types.js';

export const UserTypeResolvers = {
  id: (user: User) => user.id,
  name: (user: User) => user.name,
  balance: (user: User) => user.balance,
  posts: (user: User, _: unknown, context: GraphQLContext) => {
    return context.loaders.postLoader.load(user.id);
  },
  profile: (user: User, _: unknown, context: GraphQLContext) => {
    return context.loaders.profileLoader.load(user.id);
  },
  userSubscribedTo: (user: User, _: unknown, context: GraphQLContext, info: GraphQLResolveInfo) => {
    if (!shouldIncludeSubscriptions(info)) {
      return null;
    }
    return context.loaders.userSubscriptionsLoader.load(user.id);
  },
  subscribedToUser: (user: User, _: unknown, context: GraphQLContext, info: GraphQLResolveInfo) => {
    if (!shouldIncludeSubscriptions(info)) {
      return null;
    }
    return context.loaders.userSubscribersLoader.load(user.id);
  },
};