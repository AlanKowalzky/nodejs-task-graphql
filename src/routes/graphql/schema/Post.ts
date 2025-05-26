import { GraphQLFieldResolver } from 'graphql';
import { Post, User } from '@prisma/client';
import { GraphQLContext } from '../context';

export const PostTypeResolvers: Record<
  string,
  GraphQLFieldResolver<Post, GraphQLContext, any>
> = {
  author: (parentPost: Post, _args, context: GraphQLContext): Promise<User | null> => {
    // Używamy userLoader do pobrania autora posta na podstawie parentPost.authorId
    return context.loaders.userLoader.load(parentPost.authorId);
  },
};