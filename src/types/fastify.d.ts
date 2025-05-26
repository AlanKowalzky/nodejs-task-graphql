import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { GraphQLContext } from '../routes/graphql/context.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    loaders: GraphQLContext['loaders'];
  }
} 