import { PrismaClient } from '@prisma/client';
import { createLoaders } from './loaders.js';

export interface GraphQLContext {
  prisma: PrismaClient;
  loaders: ReturnType<typeof createLoaders>;
}