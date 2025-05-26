import { GraphQLSchema } from 'graphql';
import { QueryTypeGQL } from './Query.js';
import { MutationTypeGQL } from './Mutation.js';
import { UserTypeGQL, PostTypeGQL, ProfileTypeGQL, MemberTypeGQL } from './types.js';

export const graphqlSchema = new GraphQLSchema({
  query: QueryTypeGQL,
  mutation: MutationTypeGQL,
  types: [UserTypeGQL, PostTypeGQL, ProfileTypeGQL, MemberTypeGQL],
}); 