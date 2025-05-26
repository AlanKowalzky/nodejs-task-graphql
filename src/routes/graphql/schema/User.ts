import { GraphQLFieldResolver } from 'graphql';
import { User, Post, Profile } from '@prisma/client';
import { GraphQLContext } from '../context.js';

export const UserTypeResolvers: Record<string, GraphQLFieldResolver<User, GraphQLContext, any>> = {
  posts: (parent: User, _args, context: GraphQLContext): Promise<Post[]> => {
    if (!parent.id) return Promise.resolve([]);
    return context.loaders.postLoader.load(parent.id);
  },
  profile: (parent: User, _args, context: GraphQLContext): Promise<Profile | null> => {
    if (!parent.id) return Promise.resolve(null);
    return context.loaders.profileLoader.load(parent.id);
  },
  userSubscribedTo: (parent: User, _args, context: GraphQLContext): Promise<User[]> => {
    if (!parent.id) return Promise.resolve([]);
    return context.loaders.userSubscriptionsLoader.load(parent.id);
  },
  subscribedToUser: (parent: User, _args, context: GraphQLContext): Promise<User[]> => {
    if (!parent.id) return Promise.resolve([]);
    return context.loaders.userSubscribersLoader.load(parent.id);
  },
};