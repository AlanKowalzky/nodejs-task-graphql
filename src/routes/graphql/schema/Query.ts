import { GraphQLFieldResolver, GraphQLResolveInfo, GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLID, GraphQLString } from 'graphql';
import { User, Post, Profile, MemberType } from '@prisma/client';
import { GraphQLContext } from '../context.js';
import { shouldIncludeSubscriptions } from '../loaders.js';
import { UserTypeGQL, PostTypeGQL, ProfileTypeGQL, MemberTypeGQL } from './types.js';

// Pomocnicza funkcja do sprawdzania, czy obiekt jest użytkownikiem Prisma (podstawowe sprawdzenie)
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.balance === 'number';
}

export const QueryResolvers: Record<string, GraphQLFieldResolver<unknown, GraphQLContext, any>> = {
  users: async (_parent, _args, context: GraphQLContext, info: GraphQLResolveInfo): Promise<User[]> => {
    const includeSubs = shouldIncludeSubscriptions(info);
    const usersFromDb = await context.prisma.user.findMany({
      include: {
        userSubscribedTo: includeSubs,
        subscribedToUser: includeSubs,
      },
    });

    // Wypełnianie pamięci podręcznej (cache priming)
    usersFromDb.forEach(user => {
      context.loaders.userLoader.prime(user.id, user);
      if (includeSubs) {
        user.userSubscribedTo?.forEach(sub => {
          context.loaders.userLoader.prime(sub.authorId, user);
        });
        user.subscribedToUser?.forEach(sub => {
          context.loaders.userLoader.prime(sub.subscriberId, user);
        });
      }
    });
    return usersFromDb;
  },
  user: (_parent, { id }: { id: string }, context: GraphQLContext): Promise<User | null> => {
    return context.loaders.userLoader.load(id);
  },
  posts: async (_parent, _args, context: GraphQLContext): Promise<Post[]> => {
    const posts = await context.prisma.post.findMany();
    posts.forEach(post => {
      context.loaders.postLoader.prime(post.authorId, [post]);
    });
    return posts;
  },
  post: (_parent, { id }: { id: string }, context: GraphQLContext): Promise<Post | null> => {
    // Zakładamy, że nie ma dedykowanego singlePostLoader, używamy Prisma bezpośrednio
    return context.prisma.post.findUnique({ where: { id } });
  },
  memberTypes: async (_parent, _args, context: GraphQLContext): Promise<MemberType[]> => {
    const memberTypes = await context.prisma.memberType.findMany();
    memberTypes.forEach(memberType => {
      context.loaders.memberTypeLoader.prime(memberType.id, memberType);
    });
    return memberTypes;
  },
  memberType: (_parent, { id }: { id: string }, context: GraphQLContext): Promise<MemberType | null> => {
    return context.loaders.memberTypeLoader.load(id);
  },
  profiles: async (_parent, _args, context: GraphQLContext): Promise<Profile[]> => {
    const profiles = await context.prisma.profile.findMany();
    profiles.forEach(profile => {
      context.loaders.profileLoader.prime(profile.userId, profile);
    });
    return profiles;
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

export const QueryTypeGQL = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: new GraphQLList(new GraphQLNonNull(UserTypeGQL)),
      resolve: async (_: unknown, __: unknown, context: GraphQLContext) => {
        return context.prisma.user.findMany();
      },
    },
    user: {
      type: UserTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        return context.prisma.user.findUnique({
          where: { id },
        });
      },
    },
    posts: {
      type: new GraphQLList(new GraphQLNonNull(PostTypeGQL)),
      resolve: async (_: unknown, __: unknown, context: GraphQLContext) => {
        return context.prisma.post.findMany();
      },
    },
    post: {
      type: PostTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        return context.prisma.post.findUnique({
          where: { id },
        });
      },
    },
    memberTypes: {
      type: new GraphQLList(new GraphQLNonNull(MemberTypeGQL)),
      resolve: async (_: unknown, __: unknown, context: GraphQLContext) => {
        return context.prisma.memberType.findMany();
      },
    },
    memberType: {
      type: MemberTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        return context.prisma.memberType.findUnique({
          where: { id },
        });
      },
    },
    profiles: {
      type: new GraphQLList(new GraphQLNonNull(ProfileTypeGQL)),
      resolve: async (_: unknown, __: unknown, context: GraphQLContext) => {
        return context.prisma.profile.findMany();
      },
    },
    profile: {
      type: ProfileTypeGQL,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
        return context.prisma.profile.findUnique({
          where: { id },
        });
      },
    },
  },
});