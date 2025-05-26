import { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLID } from 'graphql';
import { QueryResolvers } from './Query.js';
import { MutationResolvers } from './Mutation.js';
import {
  UserTypeGQL,
  PostTypeGQL,
  ProfileTypeGQL,
  MemberTypeGQL,
  CreateUserInputGQL,
  UpdateUserInputGQL,
  CreatePostInputGQL,
  // UpdatePostInputGQL, // Zmień na ChangePostInputGQL
  CreateProfileInputGQL,
  // UpdateProfileInputGQL, // Zmień na ChangeProfileInputGQL
  UUIDTypeGQL,
} from './types.js';

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: new GraphQLList(new GraphQLNonNull(UserTypeGQL)),
      resolve: QueryResolvers.users,
    },
    user: {
      type: UserTypeGQL,
      args: { id: { type: new GraphQLNonNull(UUIDTypeGQL) } },
      resolve: QueryResolvers.user,
    },
    posts: {
      type: new GraphQLList(new GraphQLNonNull(PostTypeGQL)),
      resolve: QueryResolvers.posts,
    },
    post: {
      type: PostTypeGQL,
      args: { id: { type: new GraphQLNonNull(UUIDTypeGQL) } },
      resolve: QueryResolvers.post,
    },
    // Dodaj resolvery dla memberTypes, memberType, profiles, profile
  },
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: UserTypeGQL, // Zgodnie ze schematem docelowym, zwraca User, a nie User!
      args: { dto: { type: new GraphQLNonNull(CreateUserInputGQL) } },
      resolve: MutationResolvers.createUser,
    },
    updateUser: {
      type: UserTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(UUIDTypeGQL) },
        dto: { type: new GraphQLNonNull(UpdateUserInputGQL) },
      },
      resolve: MutationResolvers.updateUser,
    },
    deleteUser: {
      type: UserTypeGQL,
      args: { id: { type: new GraphQLNonNull(UUIDTypeGQL) } },
      resolve: MutationResolvers.deleteUser,
    },
    // Dodaj pozostałe mutacje (createPost, changePost, deletePost, createProfile, changeProfile, deleteProfile, subscribeTo, unsubscribeFrom)
  },
});

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
  types: [UserTypeGQL, PostTypeGQL, ProfileTypeGQL, MemberTypeGQL], // Dodaj wszystkie typy, aby były częścią schematu
});