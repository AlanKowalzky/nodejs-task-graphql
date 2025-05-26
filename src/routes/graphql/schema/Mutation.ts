import { GraphQLFieldResolver, GraphQLError } from 'graphql';
import { User, Post, Profile } from '@prisma/client';
import { GraphQLContext } from '../context';
import {
  CreateUserInput,
  UpdateUserInput,
  CreatePostInput,
  ChangePostInput,
  CreateProfileInput,
  ChangeProfileInput,
} from './types'; // Zakładamy, że typy DTO są zdefiniowane w types.ts

export const MutationResolvers: Record<
  string,
  GraphQLFieldResolver<unknown, GraphQLContext, any>
> = {
  createUser: async (
    _parent,
    { dto }: { dto: CreateUserInput },
    context: GraphQLContext,
  ): Promise<User> => {
    const newUser = await context.prisma.user.create({
      data: dto,
    });
    // Opcjonalnie: Prime userLoader cache
    context.loaders.userLoader.prime(newUser.id, newUser);
    return newUser;
  },

  createPost: async (
    _parent,
    { dto }: { dto: CreatePostInput },
    context: GraphQLContext,
  ): Promise<Post> => {
    const newPost = await context.prisma.post.create({
      data: dto,
    });
    // Opcjonalnie: Prime postLoader cache (jeśli istnieje i jest sensowny)
    // lub wyczyść cache postów dla danego autora, jeśli postLoader zwraca listę
    context.loaders.postLoader.clear(newPost.authorId); // Przykład czyszczenia
    return newPost;
  },

  createProfile: async (
    _parent,
    { dto }: { dto: CreateProfileInput },
    context: GraphQLContext,
  ): Promise<Profile> => {
    const newProfile = await context.prisma.profile.create({
      data: dto,
    });
    // Opcjonalnie: Prime profileLoader cache
    context.loaders.profileLoader.prime(newProfile.userId, newProfile);
    return newProfile;
  },

  changeUser: async (
    _parent,
    { id, dto }: { id: string; dto: UpdateUserInput },
    context: GraphQLContext,
  ): Promise<User | null> => {
    try {
      const updatedUser = await context.prisma.user.update({
        where: { id },
        data: dto,
      });
      context.loaders.userLoader.clear(id).prime(id, updatedUser);
      return updatedUser;
    } catch (error) {
      // Prisma rzuca błąd, jeśli rekord nie zostanie znaleziony przy update
      // Możemy to obsłużyć, aby zwrócić null zgodnie ze schematem lub rzucić GraphQLError
      // console.error(error); // Logowanie błędu
      return null; // Lub rzuć new GraphQLError('User not found') jeśli schemat oczekuje User!
    }
  },

  changePost: async (
    _parent,
    { id, dto }: { id: string; dto: ChangePostInput },
    context: GraphQLContext,
  ): Promise<Post | null> => {
    try {
      const updatedPost = await context.prisma.post.update({
        where: { id },
        data: dto,
      });
      // Wyczyść i zaktualizuj cache dla tego konkretnego posta, jeśli istnieje taki loader
      // lub wyczyść cache postów dla autora
      context.loaders.postLoader.clear(updatedPost.authorId);
      return updatedPost;
    } catch (error) {
      return null;
    }
  },

  changeProfile: async (
    _parent,
    { id, dto }: { id: string; dto: ChangeProfileInput },
    context: GraphQLContext,
  ): Promise<Profile | null> => {
    try {
      const updatedProfile = await context.prisma.profile.update({
        where: { id }, // Zakładamy, że 'id' to Profile.id
        data: dto,
      });
      context.loaders.profileLoader.clear(updatedProfile.userId).prime(updatedProfile.userId, updatedProfile);
      return updatedProfile;
    } catch (error) {
      return null;
    }
  },

  deleteUser: async (
    _parent,
    { id }: { id: string },
    context: GraphQLContext,
  ): Promise<User | null> => {
    try {
      const deletedUser = await context.prisma.user.delete({ where: { id } });
      context.loaders.userLoader.clear(id);
      return deletedUser;
    } catch (error) {
      return null;
    }
  },

  deletePost: async (
    _parent,
    { id }: { id: string },
    context: GraphQLContext,
  ): Promise<Post | null> => {
    try {
      // Najpierw pobierz post, aby uzyskać authorId do wyczyszczenia cache'u
      const postToDelete = await context.prisma.post.findUnique({ where: { id } });
      if (!postToDelete) return null;

      await context.prisma.post.delete({ where: { id } });
      context.loaders.postLoader.clear(postToDelete.authorId);
      return postToDelete;
    } catch (error) {
      return null;
    }
  },

  deleteProfile: async (
    _parent,
    { id }: { id: string },
    context: GraphQLContext,
  ): Promise<Profile | null> => {
    try {
      const profileToDelete = await context.prisma.profile.findUnique({ where: { id } });
      if (!profileToDelete) return null;

      await context.prisma.profile.delete({ where: { id } });
      context.loaders.profileLoader.clear(profileToDelete.userId);
      return profileToDelete;
    } catch (error) {
      return null;
    }
  },

  subscribeTo: async (
    _parent,
    { userId, authorId }: { userId: string; authorId: string },
    context: GraphQLContext,
  ): Promise<User | null> => {
    await context.prisma.subscribersOnAuthors.create({
      data: {
        subscriberId: userId,
        authorId,
      },
    });
    // Wyczyść cache subskrypcji dla obu użytkowników
    context.loaders.userSubscriptionsLoader.clear(userId);
    context.loaders.userSubscribersLoader.clear(authorId);
    return context.loaders.userLoader.load(userId); // Zwróć subskrybującego użytkownika
  },

  unsubscribeFrom: async (
    _parent,
    { userId, authorId }: { userId: string; authorId: string },
    context: GraphQLContext,
  ): Promise<User | null> => {
    await context.prisma.subscribersOnAuthors.delete({
      where: {
        subscriberId_authorId: {
          subscriberId: userId,
          authorId,
        },
      },
    });
    // Wyczyść cache subskrypcji dla obu użytkowników
    context.loaders.userSubscriptionsLoader.clear(userId);
    context.loaders.userSubscribersLoader.clear(authorId);
    return context.loaders.userLoader.load(userId); // Zwróć subskrybującego użytkownika
  },
};