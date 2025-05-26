import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInputObjectType,
} from 'graphql';
import { User, Post, Profile, MemberType } from '@prisma/client';
import { GraphQLContext } from '../context.js';
import { shouldIncludeSubscriptions } from '../loaders.js';

// Import resolverów dla poszczególnych typów
import { UserTypeResolvers } from './User.js';
import { PostTypeResolvers } from './Post.js';
import { ProfileTypeResolvers } from './Profile.js';
// MemberTypeResolvers, jeśli są potrzebne

type MemberTypeFields = {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
};

type ProfileFields = {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
};

type PostFields = {
  id: string;
  title: string;
  content: string;
  authorId: string;
};

type UserFields = {
  id: string;
  name: string | null;
  balance: number;
};

// Definicje typów obiektów
export const MemberTypeGQL = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: GraphQLString },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  },
});

// Deklarujemy typy przed ich użyciem
let UserTypeGQL: GraphQLObjectType;
let PostTypeGQL: GraphQLObjectType;
let ProfileTypeGQL: GraphQLObjectType;

// Inicjalizujemy typy w odpowiedniej kolejności
UserTypeGQL = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    balance: { type: GraphQLInt },
    posts: { 
      type: new GraphQLList(PostTypeGQL),
      resolve: async (parent: User, _args: unknown, context: GraphQLContext) => {
        return context.prisma.post.findMany({
          where: { authorId: parent.id }
        });
      }
    },
    profile: { 
      type: ProfileTypeGQL,
      resolve: async (parent: User, _args: unknown, context: GraphQLContext) => {
        return context.prisma.profile.findUnique({
          where: { userId: parent.id }
        });
      }
    },
    userSubscribedTo: { 
      type: new GraphQLList(UserTypeGQL),
      resolve: async (parent: User, _args: unknown, context: GraphQLContext) => {
        if (!shouldIncludeSubscriptions()) return [];
        return context.userSubscriptionsLoader.load(parent.id);
      }
    },
    subscribedToUser: { 
      type: new GraphQLList(UserTypeGQL),
      resolve: async (parent: User, _args: unknown, context: GraphQLContext) => {
        if (!shouldIncludeSubscriptions()) return [];
        return context.userSubscribersLoader.load(parent.id);
      }
    },
  }),
});

PostTypeGQL = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLString },
    author: { 
      type: UserTypeGQL,
      resolve: async (parent: Post, _args: unknown, context: GraphQLContext) => {
        return context.userLoader.load(parent.authorId);
      }
    },
  }),
});

ProfileTypeGQL = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLString },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
    user: { 
      type: UserTypeGQL,
      resolve: async (parent: Profile, _args: unknown, context: GraphQLContext) => {
        return context.userLoader.load(parent.userId);
      }
    },
    memberType: { 
      type: MemberTypeGQL,
      resolve: async (parent: Profile, _args: unknown, context: GraphQLContext) => {
        return context.memberTypeLoader.load(parent.memberTypeId);
      }
    },
  }),
});

// Eksportujemy typy
export { UserTypeGQL, PostTypeGQL, ProfileTypeGQL };

// Typy wejściowe dla mutacji
export const CreateUserInputGQL = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

export const UpdateUserInputGQL = new GraphQLInputObjectType({
  name: 'UpdateUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLInt },
  },
});

export const CreatePostInputGQL = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const CreateProfileInputGQL = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    userId: { type: new GraphQLNonNull(GraphQLString) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

export const ChangePostInputGQL = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

export const ChangeProfileInputGQL = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: GraphQLString },
  },
});

export const UUIDTypeGQL = GraphQLID;

export const QueryTypeGQL = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: { 
      type: new GraphQLList(UserTypeGQL),
      resolve: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
        return context.prisma.user.findMany();
      }
    },
    user: { 
      type: UserTypeGQL, 
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
        return context.userLoader.load(args.id);
      }
    },
    posts: { 
      type: new GraphQLList(PostTypeGQL),
      resolve: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
        return context.prisma.post.findMany();
      }
    },
    post: { 
      type: PostTypeGQL, 
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
        return context.prisma.post.findUnique({
          where: { id: args.id }
        });
      }
    },
    memberTypes: { 
      type: new GraphQLList(MemberTypeGQL),
      resolve: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
        return context.prisma.memberType.findMany();
      }
    },
    memberType: { 
      type: MemberTypeGQL, 
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
        return context.memberTypeLoader.load(args.id);
      }
    },
    profiles: { 
      type: new GraphQLList(ProfileTypeGQL),
      resolve: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
        return context.prisma.profile.findMany();
      }
    },
    profile: { 
      type: ProfileTypeGQL, 
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
        return context.profileLoader.load(args.id);
      }
    },
  },
});