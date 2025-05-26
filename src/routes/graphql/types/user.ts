import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import { UUIDType } from './uuid.js';
import { ProfileType } from './profile.js';
import { PostType } from './post.js';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(UUIDType) },
    profile: {
      type: ProfileType,
      resolve: (user, _, { prisma }) =>
        prisma.profile.findUnique({ where: { userId: user.id } }),
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (user, _, { prisma }) =>
        prisma.post.findMany({ where: { authorId: user.id } }),
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (user, _, { prisma }) => {
        if (!user.subscribedToUserIds || user.subscribedToUserIds.length === 0) return [];
        return prisma.user.findMany({ where: { id: { in: user.subscribedToUserIds } } });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (user, _, { prisma }) => {
        if (!user.userSubscribedToIds || user.userSubscribedToIds.length === 0) return [];
        return prisma.user.findMany({ where: { id: { in: user.userSubscribedToIds } } });
      },
    },
  }),
}); 