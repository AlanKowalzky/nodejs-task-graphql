import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList, GraphQLNonNull, GraphQLBoolean, GraphQLInt, GraphQLScalarType, Kind, GraphQLInputObjectType } from 'graphql';

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

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
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
      type: new GraphQLList(PostType),
      resolve: async (parent, _, { prisma }) => {
        return prisma.post.findMany({
          where: { authorId: parent.id },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (parent, _, { prisma }) => {
        const subscriptions = await prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: parent.id },
          include: { author: true },
        });
        return subscriptions.map(sub => sub.author);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (parent, _, { prisma }) => {
        const subscriptions = await prisma.subscribersOnAuthors.findMany({
          where: { authorId: parent.id },
          include: { subscriber: true },
        });
        return subscriptions.map(sub => sub.subscriber);
      },
    },
  }),
});

const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    authorId: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

const ChangeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeIdType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  },
});

const ChangePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      users: {
        type: new GraphQLList(UserType),
        resolve: async (_, __, { prisma }) => {
          return prisma.user.findMany();
        },
      },
      user: {
        type: UserType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { prisma }) => {
          return prisma.user.findUnique({
            where: { id },
          });
        },
      },
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
        contextValue: { prisma },
      });
      return result;
    },
  });
};

export default plugin;
