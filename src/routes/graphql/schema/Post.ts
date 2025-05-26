import { Post, User } from '@prisma/client';
import { GraphQLContext } from '../context.js';
import { PostTypeGQL, UserTypeGQL } from './types.js';

export const PostTypeResolvers = {
  id: (post: Post) => post.id,
  title: (post: Post) => post.title,
  content: (post: Post) => post.content,
  authorId: (post: Post) => post.authorId,
  author: (post: Post, _: unknown, context: GraphQLContext) => {
    return context.loaders.userLoader.load(post.authorId);
  },
};