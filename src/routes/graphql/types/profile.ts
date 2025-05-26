import { GraphQLObjectType, GraphQLID, GraphQLBoolean, GraphQLInt, GraphQLString, GraphQLNonNull } from 'graphql';
import { Profile } from '@prisma/client';
import { GraphQLContext } from '../context.js';

type GetUserType = () => GraphQLObjectType;
type GetMemberTypeType = () => GraphQLObjectType;

export const createProfileType = (
  getUserType: GetUserType,
  getMemberTypeType: GetMemberTypeType
) => new GraphQLObjectType<Profile, GraphQLContext>({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    user: {
      type: getUserType(),
      resolve: (parent: Profile, _args, context: GraphQLContext) => {
        return context.loaders.userLoader.load(parent.userId);
      },
    },
    userId: { type: new GraphQLNonNull(GraphQLID) },
    memberType: {
      type: getMemberTypeType(),
      resolve: (parent: Profile, _args, context: GraphQLContext) => {
        return context.loaders.memberTypeLoader.load(parent.memberTypeId);
      },
    },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
  }),
}); 