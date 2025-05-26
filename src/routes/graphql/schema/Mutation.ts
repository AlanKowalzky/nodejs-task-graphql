import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { GraphQLContext } from '../context.js';
import { UserTypeGQL, PostTypeGQL, ProfileTypeGQL } from './types.js';
import {
  CreateUserInputGQL,
  UpdateUserInputGQL,
  CreatePostInputGQL,
  ChangePostInputGQL,
  CreateProfileInputGQL,
  ChangeProfileInputGQL,
} from './types.js';

export const MutationTypeGQL = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: UserTypeGQL,
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInputGQL) },
      },
      resolve: async (_: unknown, { dto }: { dto: { name: string; balance: number } }, context: GraphQLContext) => {
        return context.prisma.user.create({
          data: dto,
        });
      },
    },
    updateUser: {
      type: UserTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        dto: { type: new GraphQLNonNull(UpdateUserInputGQL) },
      },
      resolve: async (_: unknown, { id, dto }: { id: string; dto: { name?: string; balance?: number } }, context: GraphQLContext) => {
        return context.prisma.user.update({
          where: { id },
          data: dto,
        });
      },
    },
    deleteUser: {
      type: UserTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        return context.prisma.user.delete({
          where: { id },
        });
      },
    },
    createPost: {
      type: PostTypeGQL,
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInputGQL) },
      },
      resolve: async (_: unknown, { dto }: { dto: { title: string; content: string; authorId: string } }, context: GraphQLContext) => {
        return context.prisma.post.create({
          data: dto,
        });
      },
    },
    updatePost: {
      type: PostTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        dto: { type: new GraphQLNonNull(ChangePostInputGQL) },
      },
      resolve: async (_: unknown, { id, dto }: { id: string; dto: { title?: string; content?: string } }, context: GraphQLContext) => {
        return context.prisma.post.update({
          where: { id },
          data: dto,
        });
      },
    },
    deletePost: {
      type: PostTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        return context.prisma.post.delete({
          where: { id },
        });
      },
    },
    createProfile: {
      type: ProfileTypeGQL,
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInputGQL) },
      },
      resolve: async (_: unknown, { dto }: { dto: { userId: string; memberTypeId: string; isMale: boolean; yearOfBirth: number } }, context: GraphQLContext) => {
        return context.prisma.profile.create({
          data: dto,
        });
      },
    },
    updateProfile: {
      type: ProfileTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        dto: { type: new GraphQLNonNull(ChangeProfileInputGQL) },
      },
      resolve: async (_: unknown, { id, dto }: { id: string; dto: { isMale?: boolean; yearOfBirth?: number; memberTypeId?: string } }, context: GraphQLContext) => {
        return context.prisma.profile.update({
          where: { id },
          data: dto,
        });
      },
    },
    deleteProfile: {
      type: ProfileTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        return context.prisma.profile.delete({
          where: { id },
        });
      },
    },
    subscribeTo: {
      type: UserTypeGQL,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { userId, authorId }: { userId: string; authorId: string }, context: GraphQLContext) => {
        await context.prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: userId,
            authorId,
          },
        });
        return context.prisma.user.findUnique({
          where: { id: userId },
        });
      },
    },
    unsubscribeFrom: {
      type: UserTypeGQL,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { userId, authorId }: { userId: string; authorId: string }, context: GraphQLContext) => {
        await context.prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId,
            },
          },
        });
        return context.prisma.user.findUnique({
          where: { id: userId },
        });
      },
    },
  },
});