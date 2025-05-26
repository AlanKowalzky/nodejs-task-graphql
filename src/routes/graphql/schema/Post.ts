import { GraphQLFieldResolver } from 'graphql';
import { Post, User } from '@prisma/client';
import { GraphQLContext } from '../context.js';

type PostResolverArgs = Record<string, never>;

export const PostTypeResolvers: Record<string, GraphQLFieldResolver<Post, GraphQLContext, PostResolverArgs>> = {
  author: (parent: Post, _args: PostResolverArgs, context: GraphQLContext): Promise<User | null> => {
    return context.loaders.userLoader.load(parent.authorId);
  },
};