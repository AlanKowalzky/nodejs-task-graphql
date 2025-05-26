import { PrismaClient, User, Post, Profile, MemberType } from '@prisma/client';
import DataLoader from 'dataloader';

export interface GraphQLContext {
  prisma: PrismaClient;
  userLoader: DataLoader<string, User | null>;
  postLoader: DataLoader<string, Post[]>;
  profileLoader: DataLoader<string, Profile | null>;
  memberTypeLoader: DataLoader<string, MemberType | null>;
  userSubscriptionsLoader: DataLoader<string, User[]>;
  userSubscribersLoader: DataLoader<string, User[]>;
}