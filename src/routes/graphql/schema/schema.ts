import { GraphQLSchema } from 'graphql';
import { QueryTypeGQL, UserTypeGQL, PostTypeGQL, ProfileTypeGQL, MemberTypeGQL } from './types.js';

export const graphqlSchema = new GraphQLSchema({
  query: QueryTypeGQL,
  types: [UserTypeGQL, PostTypeGQL, ProfileTypeGQL, MemberTypeGQL],
}); 