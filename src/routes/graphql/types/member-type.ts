import { GraphQLObjectType, GraphQLString, GraphQLFloat } from 'graphql';
import { UUIDType } from './uuid.js';

export const MemberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: UUIDType },
    discount: { type: GraphQLFloat },
    monthPostsLimit: { type: GraphQLFloat },
  }),
}); 