import { GraphQLFieldResolver, GraphQLError } from 'graphql';
import { GraphQLContext } from '../context.js';
import { User, Post, Profile } from '@prisma/client';
import {
  CreateUserInput,
  UpdateUserInput,
  CreatePostInput,
  // UpdatePostInput, // Zmień na ChangePostInput, jeśli tak jest w schemacie
  CreateProfileInput,
  // UpdateProfileInput, // Zmień na ChangeProfileInput
} from './dtoTypes.js'; // Załóżmy, że masz taki plik z typami DTO

export const MutationResolvers: Record<string, GraphQLFieldResolver<unknown, GraphQLContext, any>> = {
  createUser: async (_parent, { dto }: { dto: CreateUserInput }, context: GraphQLContext): Promise<User> => {
    // Walidacja email (jeśli jest w User, a nie Profile)
    // if (await context.prisma.user.findUnique({ where: { email: dto.email } })) {
    //   throw new GraphQLError('Email already in use.');
    // }
    return context.prisma.user.create({ data: dto });
  },
  updateUser: async (_parent, { id, dto }: { id: string; dto: UpdateUserInput }, context: GraphQLContext): Promise<User | null> => {
    try {
      const updatedUser = await context.prisma.user.update({
        where: { id },
        data: dto,
      });
      context.loaders.userLoader.clear(id).prime(id, updatedUser);
      return updatedUser;
    } catch (error) { // Prisma P2025: Record to update not found.
      return null;
    }
  },
  deleteUser: async (_parent, { id }: { id: string }, context: GraphQLContext): Promise<User | null> => {
    try {
      const user = await context.prisma.user.delete({ where: { id } });
      context.loaders.userLoader.clear(id);
      return user;
    } catch (error) { // Prisma P2025: Record to delete not found.
      return null;
    }
  },

  createPost: async (_parent, { dto }: { dto: CreatePostInput }, context: GraphQLContext): Promise<Post> => {
    const authorExists = await context.loaders.userLoader.load(dto.authorId);
    if (!authorExists) {
      throw new GraphQLError(`Author with id ${dto.authorId} not found.`);
    }
    return context.prisma.post.create({ data: dto });
  },
  // Zgodnie ze schematem docelowym, jest 'changePost', a nie 'updatePost'
  changePost: async (_parent, { id, dto }: { id: string; dto: any /* UpdatePostInput */ }, context: GraphQLContext): Promise<Post | null> => {
    try {
      // Jeśli dto.authorId jest obecne, sprawdź czy autor istnieje
      if (dto.authorId) {
        const authorExists = await context.loaders.userLoader.load(dto.authorId);
        if (!authorExists) {
          throw new GraphQLError(`Author with id ${dto.authorId} not found.`);
        }
      }
      return await context.prisma.post.update({ where: { id }, data: dto });
    } catch (error) {
      return null;
    }
  },
  deletePost: async (_parent, { id }: { id: string }, context: GraphQLContext): Promise<Post | null> => {
    try {
      return await context.prisma.post.delete({ where: { id } });
    } catch (error) {
      return null;
    }
  },

  createProfile: async (_parent, { dto }: { dto: CreateProfileInput }, context: GraphQLContext): Promise<Profile> => {
    const userExists = await context.loaders.userLoader.load(dto.userId);
    if (!userExists) throw new GraphQLError(`User with id ${dto.userId} not found.`);

    const memberTypeExists = await context.loaders.memberTypeLoader.load(dto.memberTypeId);
    if (!memberTypeExists) throw new GraphQLError(`MemberType with id ${dto.memberTypeId} not found.`);

    try {
        const newProfile = await context.prisma.profile.create({ data: dto });
        context.loaders.profileLoader.prime(dto.userId, newProfile);
        return newProfile;
    } catch (e: any) { // Prisma P2002: Unique constraint failed (userId)
        if (e?.code === 'P2002') {
            throw new GraphQLError(`Profile for user ${dto.userId} already exists.`);
        }
        throw e;
    }
  },
  // Zgodnie ze schematem docelowym, jest 'changeProfile', a nie 'updateProfile'
  changeProfile: async (_parent, { id, dto }: { id: string; dto: any /* UpdateProfileInput */ }, context: GraphQLContext): Promise<Profile | null> => {
    try {
      const existingProfile = await context.prisma.profile.findUnique({ where: { id } });
      if (!existingProfile) return null;

      if (dto.memberTypeId) {
        const memberTypeExists = await context.loaders.memberTypeLoader.load(dto.memberTypeId);
        if (!memberTypeExists) throw new GraphQLError(`MemberType with id ${dto.memberTypeId} not found.`);
      }
       // Nie pozwalamy na zmianę userId dla profilu
      const { userId, ...restDto } = dto; // eslint-disable-line
      if (userId && userId !== existingProfile.userId) {
        throw new GraphQLError('Cannot change userId for an existing profile.');
      }

      const updatedProfile = await context.prisma.profile.update({ where: { id }, data: restDto });
      context.loaders.profileLoader.clear(updatedProfile.userId).prime(updatedProfile.userId, updatedProfile);
      return updatedProfile;
    } catch (error) {
      return null;
    }
  },
  deleteProfile: async (_parent, { id }: { id: string }, context: GraphQLContext): Promise<Profile | null> => {
    try {
      const profile = await context.prisma.profile.findUnique({where: {id}});
      if (!profile) return null;
      await context.prisma.profile.delete({ where: { id } });
      context.loaders.profileLoader.clear(profile.userId);
      return profile;
    } catch (error) {
      return null;
    }
  },
  // subscribeTo i unsubscribeFrom - zaimplementuj podobnie, sprawdzając istnienie użytkowników
  // i aktualizując cache userSubscriptionsLoader/userSubscribersLoader
};