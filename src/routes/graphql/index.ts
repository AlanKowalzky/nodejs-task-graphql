import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList, GraphQLNonNull, GraphQLBoolean, GraphQLInt, GraphQLScalarType, Kind, GraphQLInputObjectType, GraphQLOutputType, GraphQLType } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { createLoaders, shouldIncludeSubscriptions } from './loaders.js';

const UUIDType = new GraphQLScalarType({
  name: 'UUID',
  description: 'UUID custom scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});

const MemberTypeIdType = new GraphQLScalarType({
  name: 'MemberTypeId',
  description: 'MemberTypeId custom scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});

const MemberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: new GraphQLNonNull(MemberTypeIdType) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: MemberTypeType,
      resolve: async (parent, _, { prisma }) => {
        return prisma.memberType.findUnique({
          where: { id: parent.memberTypeId },
        });
      },
    },
  },
});

const SubscriberType = new GraphQLObjectType({
  name: 'Subscriber',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    author: {
      type: new GraphQLNonNull(SubscriberType),
      resolve: async (parent, _, { loaders }) => {
        return loaders.userLoader.load(parent.authorId);
      },
    },
  },
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: async (parent, _, { prisma }) => {
        return prisma.profile.findUnique({
          where: { userId: parent.id },
        });
      },
    },
    posts: {
      type: new GraphQLList(PostType) as GraphQLOutputType,
      resolve: async (parent, _, { prisma }) => {
        return prisma.post.findMany({
          where: { authorId: parent.id },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(SubscriberType) as GraphQLOutputType,
      resolve: async (parent, _, { loaders }, info) => {
        if (!shouldIncludeSubscriptions(info)) {
          return [];
        }
        return loaders.userSubscriptionsLoader.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(SubscriberType) as GraphQLOutputType,
      resolve: async (parent, _, { loaders }, info) => {
        if (!shouldIncludeSubscriptions(info)) {
          return [];
        }
        return loaders.userSubscribersLoader.load(parent.id);
      },
    },
  },
});

const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
});

const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdType) },
  },
});

const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

const ChangePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

const ChangeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeIdType },
  },
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      memberTypes: {
        type: new GraphQLList(MemberTypeType),
        resolve: async (_, __, { prisma }) => {
          return prisma.memberType.findMany();
        },
      },
      memberType: {
        type: MemberTypeType,
        args: {
          id: { type: new GraphQLNonNull(MemberTypeIdType) },
        },
        resolve: async (_, { id }, { prisma }) => {
          return prisma.memberType.findUnique({
            where: { id },
          });
        },
      },
      posts: {
        type: new GraphQLList(PostType),
        resolve: async (_, __, { prisma }) => {
          return prisma.post.findMany();
        },
      },
      post: {
        type: PostType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { prisma }) => {
          return prisma.post.findUnique({
            where: { id },
          });
        },
      },
      users: {
        type: new GraphQLList(UserType),
        resolve: async (_, __, { loaders }) => {
          const users = await loaders.userLoader.loadMany(['*']);
          return users.filter(user => user !== null);
        },
      },
      user: {
        type: UserType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { loaders }) => {
          return loaders.userLoader.load(id);
        },
      },
      profiles: {
        type: new GraphQLList(ProfileType),
        resolve: async (_, __, { prisma }) => {
          return prisma.profile.findMany();
        },
      },
      profile: {
        type: ProfileType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { prisma }) => {
          return prisma.profile.findUnique({
            where: { id },
          });
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createUser: {
        type: UserType,
        args: {
          dto: { type: new GraphQLNonNull(CreateUserInputType) },
        },
        resolve: async (_, { dto }, { prisma }) => {
          return prisma.user.create({
            data: dto,
          });
        },
      },
      createPost: {
        type: PostType,
        args: {
          dto: { type: new GraphQLNonNull(CreatePostInputType) },
        },
        resolve: async (_, { dto }, { prisma }) => {
          return prisma.post.create({
            data: dto,
          });
        },
      },
      createProfile: {
        type: ProfileType,
        args: {
          dto: { type: new GraphQLNonNull(CreateProfileInputType) },
        },
        resolve: async (_, { dto }, { prisma }) => {
          return prisma.profile.create({
            data: dto,
          });
        },
      },
      deleteUser: {
        type: GraphQLBoolean,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { prisma }) => {
          await prisma.user.delete({
            where: { id },
          });
          return true;
        },
      },
      deletePost: {
        type: GraphQLBoolean,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { prisma }) => {
          await prisma.post.delete({
            where: { id },
          });
          return true;
        },
      },
      deleteProfile: {
        type: GraphQLBoolean,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { prisma }) => {
          await prisma.profile.delete({
            where: { id },
          });
          return true;
        },
      },
      changeUser: {
        type: UserType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeUserInputType) },
        },
        resolve: async (_, { id, dto }, { prisma }) => {
          return prisma.user.update({
            where: { id },
            data: dto,
          });
        },
      },
      changePost: {
        type: PostType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangePostInputType) },
        },
        resolve: async (_, { id, dto }, { prisma }) => {
          return prisma.post.update({
            where: { id },
            data: dto,
          });
        },
      },
      changeProfile: {
        type: ProfileType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
        },
        resolve: async (_, { id, dto }, { prisma }) => {
          return prisma.profile.update({
            where: { id },
            data: dto,
          });
        },
      },
      subscribeTo: {
        type: GraphQLBoolean,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { userId, authorId }, { prisma }) => {
          await prisma.subscribersOnAuthors.create({
            data: {
              subscriberId: userId,
              authorId,
            },
          });
          return true;
        },
      },
      unsubscribeFrom: {
        type: GraphQLBoolean,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { userId, authorId }, { prisma }) => {
          await prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: userId,
                authorId,
              },
            },
          });
          return true;
        },
      },
    },
  }),
});

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;
  const loaders = createLoaders(prisma);

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      const result = await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: { prisma, loaders },
      });
      return result;
    },
  });
};

export default plugin;
