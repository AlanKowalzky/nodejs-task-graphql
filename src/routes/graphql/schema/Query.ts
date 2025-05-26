import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql';
import { User, Post, Profile, MemberType } from '@prisma/client';
import { GraphQLContext } from '../context';
import { shouldIncludeSubscriptions } from '../loaders';

// Pomocnicza funkcja do sprawdzania, czy obiekt jest użytkownikiem Prisma (podstawowe sprawdzenie)
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.balance === 'number';
}

export const QueryResolvers: Record<string, GraphQLFieldResolver<unknown, GraphQLContext, any>> = {
  users: async (_parent, _args, context: GraphQLContext, info: GraphQLResolveInfo): Promise<User[]> => {
    const includeSubs = shouldIncludeSubscriptions(info);
    const usersFromDb = await context.prisma.user.findMany({
      include: {
        // Warunkowe dołączanie zagnieżdżonych obiektów User dla autora i subskrybenta
        userSubscribedTo: includeSubs
          ? {
              include: {
                author: true, // Teraz sub.author będzie obiektem User
              },
            }
          : false,
        subscribedToUser: includeSubs
          ? {
              include: {
                subscriber: true, // Teraz sub.subscriber będzie obiektem User
              },
            }
          : false,
      },
    });

    // Wypełnianie pamięci podręcznej (cache priming) - test-loader-prime
    usersFromDb.forEach(user => {
      context.loaders.userLoader.prime(user.id, user);
      if (includeSubs) {
        user.userSubscribedTo?.forEach(sub => {
          if (sub.author && isUser(sub.author)) {
            context.loaders.userLoader.prime(sub.author.id, sub.author);
          }
        });
        user.subscribedToUser?.forEach(sub => {
          if (sub.subscriber && isUser(sub.subscriber)) {
            context.loaders.userLoader.prime(sub.subscriber.id, sub.subscriber);
          }
        });
      }
    });
    return usersFromDb;
  },
  user: (_parent, { id }: { id: string }, context: GraphQLContext): Promise<User | null> => {
    return context.loaders.userLoader.load(id);
  },
  posts: (_parent, _args, context: GraphQLContext): Promise<Post[]> => {
    return context.prisma.post.findMany(); // Proste pobranie wszystkich postów
  },
  post: (_parent, { id }: { id: string }, context: GraphQLContext): Promise<Post | null> => {
    // Zakładamy, że nie ma dedykowanego singlePostLoader, używamy Prisma bezpośrednio
    return context.prisma.post.findUnique({ where: { id } });
  },
  memberTypes: (_parent, _args, context: GraphQLContext): Promise<MemberType[]> => {
    return context.prisma.memberType.findMany();
  },
  memberType: (_parent, { id }: { id: string }, context: GraphQLContext): Promise<MemberType | null> => {
    return context.loaders.memberTypeLoader.load(id);
  },
  profiles: (_parent, _args, context: GraphQLContext): Promise<Profile[]> => {
    return context.prisma.profile.findMany();
  },
  profile: (_parent, { id }: { id: string }, context: GraphQLContext): Promise<Profile | null> => {
    // Zakładamy, że 'id' to Profile.id, a profileLoader jest kluczowany przez userId.
    // Jeśli chcemy pobierać profil po jego własnym ID, potrzebny byłby inny loader lub bezpośrednie zapytanie.
    // Dla uproszczenia, jeśli profileLoader jest na userId, to zapytanie o profil po jego ID
    // powinno być obsługiwane inaczej lub ten resolver powinien przyjmować userId.
    // Na razie zostawiamy bezpośrednie zapytanie Prisma, zakładając, że 'id' to Profile.id.
    return context.prisma.profile.findUnique({ where: { id } });
  },
};