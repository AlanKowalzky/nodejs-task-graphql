import { GraphQLObjectType, GraphQLID, GraphQLFloat, GraphQLInt, GraphQLNonNull } from 'graphql';
import { MemberType } from '@prisma/client';
import { GraphQLContext } from '../context.js';

export const MemberTypeType = new GraphQLObjectType<MemberType, GraphQLContext>({
  name: 'MemberType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  }),
}); 