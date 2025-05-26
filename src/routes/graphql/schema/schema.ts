import { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLID } from 'graphql';
import {
  UserTypeGQL,
  PostTypeGQL,
  ProfileTypeGQL,
  MemberTypeGQL,
  CreateUserInputGQL,
  UpdateUserInputGQL,
  CreatePostInputGQL,
  ChangePostInputGQL,
  CreateProfileInputGQL,
  ChangeProfileInputGQL,
  UUIDTypeGQL,
} from './types.js';
import { QueryResolvers } from './Query.js';
import { MutationResolvers } from './Mutation.js';

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserTypeGQL))),
      resolve: QueryResolvers.users,
    },
    user: {
      type: UserTypeGQL,
      args: { id: { type: new GraphQLNonNull(UUIDTypeGQL) } },
      resolve: QueryResolvers.user,
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostTypeGQL))),
      resolve: QueryResolvers.posts,
    },
    post: {
      type: PostTypeGQL,
      args: { id: { type: new GraphQLNonNull(UUIDTypeGQL) } },
      resolve: QueryResolvers.post,
    },
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberTypeGQL))),
      resolve: QueryResolvers.memberTypes,
    },
    memberType: {
      type: MemberTypeGQL,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } }, // Zgodnie ze schematem to ID, nie UUID
      resolve: QueryResolvers.memberType,
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileTypeGQL))),
      resolve: QueryResolvers.profiles,
    },
    profile: {
      type: ProfileTypeGQL,
      args: { id: { type: new GraphQLNonNull(UUIDTypeGQL) } },
      resolve: QueryResolvers.profile,
    },
  },
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: UserTypeGQL,
      args: { dto: { type: new GraphQLNonNull(CreateUserInputGQL) } },
      resolve: MutationResolvers.createUser,
    },
    createPost: {
      type: PostTypeGQL,
      args: { dto: { type: new GraphQLNonNull(CreatePostInputGQL) } },
      resolve: MutationResolvers.createPost,
    },
    createProfile: {
      type: ProfileTypeGQL,
      args: { dto: { type: new GraphQLNonNull(CreateProfileInputGQL) } },
      resolve: MutationResolvers.createProfile,
    },
    changeUser: {
      type: UserTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(UUIDTypeGQL) },
        dto: { type: new GraphQLNonNull(UpdateUserInputGQL) },
      },
      resolve: MutationResolvers.changeUser,
    },
    changePost: {
      type: PostTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(UUIDTypeGQL) },
        dto: { type: new GraphQLNonNull(ChangePostInputGQL) },
      },
      resolve: MutationResolvers.changePost,
    },
    changeProfile: {
      type: ProfileTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(UUIDTypeGQL) },
        dto: { type: new GraphQLNonNull(ChangeProfileInputGQL) },
      },
      resolve: MutationResolvers.changeProfile,
    },
    deleteUser: {
      type: UserTypeGQL,
      args: { id: { type: new GraphQLNonNull(UUIDTypeGQL) } },
      resolve: MutationResolvers.deleteUser,
    },
    deletePost: {
      type: PostTypeGQL,
      args: { id: { type: new GraphQLNonNull(UUIDTypeGQL) } },
      resolve: MutationResolvers.deletePost,
    },
    deleteProfile: {
      type: ProfileTypeGQL,
      args: { id: { type: new GraphQLNonNull(UUIDTypeGQL) } },
      resolve: MutationResolvers.deleteProfile,
    },
    subscribeTo: {
      type: UserTypeGQL,
      args: {
        userId: { type: new GraphQLNonNull(UUIDTypeGQL) },
        authorId: { type: new GraphQLNonNull(UUIDTypeGQL) },
      },
      resolve: MutationResolvers.subscribeTo,
    },
    unsubscribeFrom: {
      type: UserTypeGQL,
      args: {
        userId: { type: new GraphQLNonNull(UUIDTypeGQL) },
        authorId: { type: new GraphQLNonNull(UUIDTypeGQL) },
      },
      resolve: MutationResolvers.unsubscribeFrom,
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
  types: [UserTypeGQL, PostTypeGQL, ProfileTypeGQL, MemberTypeGQL], // Jawne dodanie wszystkich typów obiektów
});