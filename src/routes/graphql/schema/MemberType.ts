import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLFloat } from 'graphql';
import { MemberType } from '@prisma/client';

export const MemberTypeGQL = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: GraphQLString },
    discount: { type: GraphQLFloat },
    monthPostsLimit: { type: GraphQLInt },
  },
}); 