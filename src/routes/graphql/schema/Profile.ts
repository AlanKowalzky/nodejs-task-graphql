import { GraphQLFieldResolver } from 'graphql';
import { Profile, User, MemberType } from '@prisma/client';
import { GraphQLContext } from '../context.js';

export const ProfileTypeResolvers: Record<string, GraphQLFieldResolver<Profile, GraphQLContext, any>> = {
  user: (parent: Profile, _args, context: GraphQLContext): Promise<User | null> => {
    return context.loaders.userLoader.load(parent.userId);
  },
  memberType: (parent: Profile, _args, context: GraphQLContext): Promise<MemberType | null> => {
    return context.loaders.memberTypeLoader.load(parent.memberTypeId);
  },
};