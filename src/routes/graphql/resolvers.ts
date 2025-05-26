import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { GraphQLObjectType, GraphQLSchema, GraphQLList } from 'graphql';
import { UserType } from './types/user.js';
import { PostType } from './types/post.js';
import { ProfileType } from './types/profile.js';
import { MemberTypeType } from './types/member-type.js';
import { UUIDType } from './types/uuid.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve: async (_, __, { prisma }) => prisma.user.findMany(),
    },
    user: {
      type: UserType,
      args: { id: { type: UUIDType } },
      resolve: async (_, { id }, { prisma }) => prisma.user.findUnique({ where: { id } }),
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (_, __, { prisma }) => prisma.post.findMany(),
    },
    post: {
      type: PostType,
      args: { id: { type: UUIDType } },
      resolve: async (_, { id }, { prisma }) => prisma.post.findUnique({ where: { id } }),
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (_, __, { prisma }) => prisma.profile.findMany(),
    },
    profile: {
      type: ProfileType,
      args: { id: { type: UUIDType } },
      resolve: async (_, { id }, { prisma }) => prisma.profile.findUnique({ where: { id } }),
    },
    memberTypes: {
      type: new GraphQLList(MemberTypeType),
      resolve: async (_, __, { prisma }) => prisma.memberType.findMany(),
    },
    memberType: {
      type: MemberTypeType,
      args: { id: { type: UUIDType } },
      resolve: async (_, { id }, { prisma }) => prisma.memberType.findUnique({ where: { id } }),
    },
  },
});

export const schema = new GraphQLSchema({
  query: QueryType,
});

export const createContext = (fastify: FastifyInstance) => {
  const prisma = new PrismaClient();
  fastify.prisma = prisma;
  
  return {
    prisma,
  };
}; 