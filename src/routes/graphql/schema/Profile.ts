import { Profile, User, MemberType } from '@prisma/client';
import { GraphQLContext } from '../context.js';
import { ProfileTypeGQL, UserTypeGQL, MemberTypeGQL } from './types.js';

export const ProfileTypeResolvers = {
  id: (profile: Profile) => profile.id,
  isMale: (profile: Profile) => profile.isMale,
  yearOfBirth: (profile: Profile) => profile.yearOfBirth,
  userId: (profile: Profile) => profile.userId,
  memberTypeId: (profile: Profile) => profile.memberTypeId,
  user: (profile: Profile, _: unknown, context: GraphQLContext) => {
    return context.loaders.userLoader.load(profile.userId);
  },
  memberType: (profile: Profile, _: unknown, context: GraphQLContext) => {
    return context.loaders.memberTypeLoader.load(profile.memberTypeId);
  },
};