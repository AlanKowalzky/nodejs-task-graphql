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

export const MemberTypeGQL = new GraphQLObjectType<MemberType, GraphQLContext>({
  name: 'MemberType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
    // profiles: { type: new GraphQLList(ProfileTypeGQL) } // Jeśli potrzebna jest relacja zwrotna
  }),
});

export const ProfileTypeGQL = new GraphQLObjectType<Profile, GraphQLContext>({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    user: {
      type: UserTypeGQL, // Zmienione na UserTypeGQL, aby uniknąć cyklicznej zależności przy starcie
      resolve: ProfileTypeResolvers.user,
    },
    userId: { type: new GraphQLNonNull(GraphQLID) },
    memberType: {
      type: MemberTypeGQL,
      resolve: ProfileTypeResolvers.memberType,
    },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) }, // Zgodnie z Prisma, to String
  }),
});

export const PostTypeGQL = new GraphQLObjectType<Post, GraphQLContext>({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    author: {
      type: UserTypeGQL,
      resolve: PostTypeResolvers.author,
    },
    authorId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});

export const UserTypeGQL = new GraphQLObjectType<User, GraphQLContext>({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString }, // Zgodnie ze schematem docelowym, name jest nullowalne
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
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

// Typy wejściowe dla mutacji (DTOs)
export const CreateUserInputGQL = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    // email jest w Profile, nie w User bezpośrednio wg schematu Prisma
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
    authorId: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export const CreateProfileInputGQL = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    userId: { type: new GraphQLNonNull(GraphQLID) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) }, // Zgodnie z Prisma, to String
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

// Dodaj inne typy wejściowe (UpdatePostInput, UpdateProfileInput) zgodnie z potrzebami
// np. ChangePostInputGQL, ChangeProfileInputGQL

export const UUIDTypeGQL = GraphQLID; // Alias dla UUID, często mapowane na GraphQLID lub GraphQLString