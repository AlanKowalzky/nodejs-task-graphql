import { Profile, User, MemberType } from '@prisma/client';
import { GraphQLContext } from '../context.js';
import { UserTypeGQL, MemberTypeGQL } from './types.js';

export const ProfileTypeResolvers = {
  id: (profile: Profile) => profile.id,
  isMale: (profile: Profile) => profile.isMale,
  yearOfBirth: (profile: Profile) => profile.yearOfBirth,
  userId: (profile: Profile) => profile.userId,
  memberTypeId: (profile: Profile) => profile.memberTypeId,
  user: async (profile: Profile, _: unknown, context: GraphQLContext) => {
    return context.prisma.user.findUnique({
      where: { id: profile.userId },
    });
  },
  memberType: async (profile: Profile, _: unknown, context: GraphQLContext) => {
    return context.prisma.memberType.findUnique({
      where: { id: profile.memberTypeId },
    });
  },
};