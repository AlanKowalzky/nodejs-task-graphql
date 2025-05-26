import { GraphQLFieldResolver } from 'graphql';
import { User, Post, Profile } from '@prisma/client';
import { GraphQLContext } from '../context';

export const UserTypeResolvers: Record<
  string,
  GraphQLFieldResolver<User, GraphQLContext, any>
> = {
  posts: (parentUser: User, _args, context: GraphQLContext): Promise<Post[]> => {
    // Zakładamy, że postLoader jest kluczowany przez authorId (czyli parentUser.id)
    // i zwraca tablicę postów dla danego autora.
    return context.loaders.postLoader.load(parentUser.id);
  },
  profile: (parentUser: User, _args, context: GraphQLContext): Promise<Profile | null> => {
    // Zakładamy, że profileLoader jest kluczowany przez userId (czyli parentUser.id)
    return context.loaders.profileLoader.load(parentUser.id);
  },
  userSubscribedTo: (parentUser: User, _args, context: GraphQLContext): Promise<User[]> => {
    // Ten loader powinien pobierać listę użytkowników, których subskrybuje parentUser
    return context.loaders.userSubscriptionsLoader.load(parentUser.id);
  },
  subscribedToUser: (parentUser: User, _args, context: GraphQLContext): Promise<User[]> => {
    // Ten loader powinien pobierać listę użytkowników, którzy subskrybują parentUser
    return context.loaders.userSubscribersLoader.load(parentUser.id);
  },
};