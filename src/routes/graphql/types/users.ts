import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLFloat, GraphQLList, GraphQLNonNull } from 'graphql';
import { User } from '@prisma/client';
import { GraphQLContext } from '../context.js';

type GetPostType = () => GraphQLObjectType;
type GetProfileType = () => GraphQLObjectType;
type GetUserType = () => GraphQLObjectType;

export const createUserType = (
  getPostType: GetPostType,
  getProfileType: GetProfileType,
  getUserType: GetUserType
) => new GraphQLObjectType<User, GraphQLContext>({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    posts: {
      type: new GraphQLList(new GraphQLNonNull(getPostType())),
      resolve: (parent: User, _args, context: GraphQLContext) => {
        return context.loaders.postLoader.load(parent.id);
      },
    },
    profile: {
      type: getProfileType(),
      resolve: (parent: User, _args, context: GraphQLContext) => {
        return context.loaders.profileLoader.load(parent.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(new GraphQLNonNull(getUserType())),
      resolve: (parent: User, _args, context: GraphQLContext) => {
        return context.loaders.userSubscriptionsLoader.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(new GraphQLNonNull(getUserType())),
      resolve: (parent: User, _args, context: GraphQLContext) => {
        return context.loaders.userSubscribersLoader.load(parent.id);
      },
    },
  }),
}); 