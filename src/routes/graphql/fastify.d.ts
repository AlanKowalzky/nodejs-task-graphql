import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    loaders: {
      userLoader: DataLoader<string, any>;
      postLoader: DataLoader<string, any[]>;
      profileLoader: DataLoader<string, any>;
      memberTypeLoader: DataLoader<string, any>;
      userSubscriptionsLoader: DataLoader<string, any[]>;
      userSubscribersLoader: DataLoader<string, any[]>;
    };
  }
} 