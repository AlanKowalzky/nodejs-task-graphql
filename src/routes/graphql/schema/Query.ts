import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
import { GraphQLContext } from '../context.js';
import { User, Post, Profile, MemberType } from '@prisma/client';
import { shouldIncludeSubscriptions } from '../loaders.js';

// Helper function to check if an object is a Prisma User (basic check)
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.balance === 'number';
}

export const QueryResolvers: Record<string, GraphQLFieldResolver<unknown, GraphQLContext, any>> = {
  users: async (_parent, _args, context: GraphQLContext, info: GraphQLResolveInfo): Promise<User[]> => {
    const includeSubs = shouldIncludeSubscriptions(info);
    const usersFromDb = await context.prisma.user.findMany({
      include: {
        userSubscribedTo: includeSubs ? { include: { author: true } } : false,
        subscribedToUser: includeSubs ? { include: { subscriber: true } } : false,
      },
    });

    // Prime cache
    usersFromDb.forEach(user => {
      context.loaders.userLoader.prime(user.id, user);
      if (includeSubs) {
        user.userSubscribedTo?.forEach(sub => sub.author && isUser(sub.author) && context.loaders.userLoader.prime(sub.author.id, sub.author));
        user.subscribedToUser?.forEach(sub => sub.subscriber && isUser(sub.subscriber) && context.loaders.userLoader.prime(sub.subscriber.id, sub.subscriber));
      }
    });
    return usersFromDb;
  },
  user: (_parent, { id }: { id: string }, context: GraphQLContext): Promise<User | null> => {
    return context.loaders.userLoader.load(id);
  },
  posts: (_parent, _args, context: GraphQLContext): Promise<Post[]> => {
    return context.prisma.post.findMany();
  },
  post: (_parent, { id }: { id: string }, context: GraphQLContext): Promise<Post | null> => {
    // Zakładamy, że nie ma dedykowanego singlePostLoader, używamy Prisma bezpośrednio
    return context.prisma.post.findUnique({ where: { id } });
  },
  memberTypes: (_parent, _args, context: GraphQLContext): Promise<MemberType[]> => {
    return context.prisma.memberType.findMany();
  },
  memberType: (_parent, { id }: { id: string }, context: GraphQLContext): Promise<MemberType | null> => {
    return context.loaders.memberTypeLoader.load(id);
  },
  profiles: (_parent, _args, context: GraphQLContext): Promise<Profile[]> => {
    return context.prisma.profile.findMany();
  },
  profile: (_parent, { id }: { id: string }, context: GraphQLContext): Promise<Profile | null> => {
    // Zakładamy, że 'id' to Profile.id, a profileLoader jest kluczem userId
    return context.prisma.profile.findUnique({ where: { id } });
  },
};