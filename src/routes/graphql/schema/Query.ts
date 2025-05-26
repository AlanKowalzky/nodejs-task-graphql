import { GraphQLFieldResolver, GraphQLResolveInfo, GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLID, GraphQLString } from 'graphql';
import { User, Post, Profile, MemberType } from '@prisma/client';
import { GraphQLContext } from '../context.js';
import { shouldIncludeSubscriptions } from '../loaders.js';
import { UserTypeGQL, PostTypeGQL, ProfileTypeGQL, MemberTypeGQL } from './types.js';

// Pomocnicza funkcja do sprawdzania, czy obiekt jest użytkownikiem Prisma (podstawowe sprawdzenie)
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.balance === 'number';
}

export const QueryTypeGQL = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: new GraphQLList(new GraphQLNonNull(UserTypeGQL)),
      resolve: async (_: unknown, __: unknown, context: GraphQLContext) => {
        return context.prisma.user.findMany();
      },
    },
    user: {
      type: UserTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        return context.loaders.userLoader.load(id);
      },
    },
    posts: {
      type: new GraphQLList(new GraphQLNonNull(PostTypeGQL)),
      resolve: async (_: unknown, __: unknown, context: GraphQLContext) => {
        return context.prisma.post.findMany();
      },
    },
    post: {
      type: PostTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        return context.prisma.post.findUnique({
          where: { id },
        });
      },
    },
    memberTypes: {
      type: new GraphQLList(new GraphQLNonNull(MemberTypeGQL)),
      resolve: async (_: unknown, __: unknown, context: GraphQLContext) => {
        return context.prisma.memberType.findMany();
      },
    },
    memberType: {
      type: MemberTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        return context.loaders.memberTypeLoader.load(id);
      },
    },
    profiles: {
      type: new GraphQLList(new GraphQLNonNull(ProfileTypeGQL)),
      resolve: async (_: unknown, __: unknown, context: GraphQLContext) => {
        return context.prisma.profile.findMany();
      },
    },
    profile: {
      type: ProfileTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        return context.prisma.profile.findUnique({
          where: { id },
        });
      },
    },
  },
});