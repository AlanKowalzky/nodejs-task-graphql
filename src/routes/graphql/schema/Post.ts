import { User, Post } from '@prisma/client';
import { GraphQLContext } from '../context.js';
import { UserTypeGQL } from './types.js';

export const PostTypeResolvers = {
  id: (post: Post) => post.id,
  title: (post: Post) => post.title,
  content: (post: Post) => post.content,
  authorId: (post: Post) => post.authorId,
  author: async (post: Post, _: unknown, context: GraphQLContext) => {
    return context.prisma.user.findUnique({
      where: { id: post.authorId },
    });
  },
};