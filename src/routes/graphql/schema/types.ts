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
    discount: { type: GraphQLFloat },
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
    balance: { type: GraphQLFloat },
    posts: {
      type: new GraphQLList(new GraphQLNonNull(PostTypeGQL)),
      resolve: UserTypeResolvers.posts,
    },
    profile: {
      type: ProfileTypeGQL,
      resolve: UserTypeResolvers.profile,
    },
    userSubscribedTo: {
      type: new GraphQLList(new GraphQLNonNull(UserTypeGQL)),
      resolve: UserTypeResolvers.userSubscribedTo,
    },
    subscribedToUser: {
      type: new GraphQLList(new GraphQLNonNull(UserTypeGQL)),
      resolve: UserTypeResolvers.subscribedToUser,
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
      resolve: PostTypeResolvers.author,
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
      resolve: ProfileTypeResolvers.user,
    },
    memberType: {
      type: MemberTypeGQL,
      resolve: ProfileTypeResolvers.memberType,
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
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

export const UpdateUserInputGQL = new GraphQLInputObjectType({
  name: 'UpdateUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
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