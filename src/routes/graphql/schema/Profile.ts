import { GraphQLFieldResolver } from 'graphql';
import { Profile, User, MemberType } from '@prisma/client';
import { GraphQLContext } from '../context.js';

type ProfileResolverArgs = Record<string, never>;

export const ProfileTypeResolvers: Record<string, GraphQLFieldResolver<Profile, GraphQLContext, ProfileResolverArgs>> = {
  user: (parent: Profile, _args: ProfileResolverArgs, context: GraphQLContext): Promise<User | null> => {
    return context.loaders.userLoader.load(parent.userId);
  },
  memberType: (parent: Profile, _args: ProfileResolverArgs, context: GraphQLContext): Promise<MemberType | null> => {
    return context.loaders.memberTypeLoader.load(parent.memberTypeId);
  },
};