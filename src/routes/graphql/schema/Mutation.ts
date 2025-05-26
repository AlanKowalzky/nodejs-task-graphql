import { GraphQLFieldResolver, GraphQLError } from 'graphql';
import { GraphQLContext } from '../context';
import { User, Post, Profile, Prisma } from '@prisma/client';
import {
  CreateUserInput,
  UpdateUserInput,
  CreatePostInput,
  ChangePostInput, // Zmieniono z UpdatePostInput
  CreateProfileInput,
  ChangeProfileInput, // Zmieniono z UpdateProfileInput
} from './dtoTypes';

export const MutationResolvers: Record<string, GraphQLFieldResolver<unknown, GraphQLContext, any>> = {
  createUser: async (_parent, { dto }: { dto: CreateUserInput }, context: GraphQLContext): Promise<User> => {
    // Walidacja email (jeśli jest w User, a nie Profile)
    // if (await context.prisma.user.findUnique({ where: { email: dto.email } })) {
    //   throw new GraphQLError('Email already in use.');
    // }
    // Zakładając, że CreateUserInput nie zawiera email, zgodnie z modelem User w Prisma
    return context.prisma.user.create({ data: dto });
  },
  updateUser: async (_parent, { id, dto }: { id: string; dto: UpdateUserInput }, context: GraphQLContext): Promise<User> => { // Zgodnie ze schematem docelowym zwraca User (nullable)
    try {
      const updatedUser = await context.prisma.user.update({
        where: { id },
        data: dto,
      });
      context.loaders.userLoader.clear(id).prime(id, updatedUser);
      return updatedUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') { // Record to update not found
        throw new GraphQLError(`Użytkownik o ID ${id} nie został znaleziony.`);
      }
      throw error;
    }
  },
  deleteUser: async (_parent, { id }: { id: string }, context: GraphQLContext): Promise<User> => { // Zgodnie ze schematem docelowym zwraca User (nullable)
    try {
      const user = await context.prisma.user.delete({ where: { id } });
      context.loaders.userLoader.clear(id);
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') { // Record to delete not found
        throw new GraphQLError(`Użytkownik o ID ${id} nie został znaleziony.`);
      }
      throw error;
    }
  },

  createPost: async (_parent, { dto }: { dto: CreatePostInput }, context: GraphQLContext): Promise<Post> => {
    const author = await context.loaders.userLoader.load(dto.authorId);
    if (!author) {
      throw new GraphQLError(`Autor o ID ${dto.authorId} nie został znaleziony.`);
    }
    return context.prisma.post.create({ data: dto });
  },
  // Zgodnie ze schematem docelowym, jest 'changePost', a nie 'updatePost'
  changePost: async (_parent, { id, dto }: { id: string; dto: ChangePostInput }, context: GraphQLContext): Promise<Post> => { // Zgodnie ze schematem docelowym zwraca Post!
    try {
      // Jeśli dto.authorId jest obecne, sprawdź czy autor istnieje
      // Uwaga: schema.graphql dla ChangePostInput nie zawiera authorId.
      // Gdyby authorId mogło być zmieniane, walidacja jego istnienia byłaby tu potrzebna.
      const updatedPost = await context.prisma.post.update({ where: { id }, data: dto });
      // Jeśli masz singlePostLoader, możesz chcieć go wypełnić:
      // context.loaders.singlePostLoader?.clear(id).prime(id, updatedPost);
      // Również, jeśli authorId zostało zmienione, lista postów starego autora w postLoader byłaby nieaktualna.
      return updatedPost;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new GraphQLError(`Post o ID ${id} nie został znaleziony.`);
      }
      throw error;
    }
  },
  deletePost: async (_parent, { id }: { id: string }, context: GraphQLContext): Promise<Post> => { // Zgodnie ze schematem docelowym zwraca Post!
    try {
      const post = await context.prisma.post.delete({ where: { id } });
      // context.loaders.singlePostLoader?.clear(id);
      // Rozważ wyczyszczenie odpowiednich części postLoader, jeśli posty są buforowane według authorId
      return post;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new GraphQLError(`Post o ID ${id} nie został znaleziony.`);
      }
      throw error;
    }
  },

  createProfile: async (_parent, { dto }: { dto: CreateProfileInput }, context: GraphQLContext): Promise<Profile> => {
    const user = await context.loaders.userLoader.load(dto.userId);
    if (!user) throw new GraphQLError(`Użytkownik o ID ${dto.userId} nie został znaleziony.`);

    const memberType = await context.loaders.memberTypeLoader.load(dto.memberTypeId);
    if (!memberType) throw new GraphQLError(`MemberType o ID ${dto.memberTypeId} nie został znaleziony.`);

    try {
      const newProfile = await context.prisma.profile.create({ data: dto });
      context.loaders.profileLoader.clear(dto.userId).prime(dto.userId, newProfile); // Wyczyść przed wypełnieniem
      return newProfile;
    } catch (e: any) { // Prisma P2002: Unique constraint failed (userId)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new GraphQLError(`Profil dla użytkownika ${dto.userId} już istnieje.`);
      }
      throw e;
    }
  },
  // Zgodnie ze schematem docelowym, jest 'changeProfile', a nie 'updateProfile'
  changeProfile: async (_parent, { id, dto }: { id: string; dto: ChangeProfileInput }, context: GraphQLContext): Promise<Profile> => { // Zgodnie ze schematem docelowym zwraca Profile!
    try {
      const existingProfile = await context.prisma.profile.findUnique({ where: { id } });
      if (!existingProfile) {
        throw new GraphQLError(`Profil o ID ${id} nie został znaleziony.`);
      }

      // Walidacja memberTypeId, jeśli jest częścią DTO i jest opcjonalne
      if (dto.memberTypeId !== undefined && dto.memberTypeId !== null) {
        const memberType = await context.loaders.memberTypeLoader.load(dto.memberTypeId);
        if (!memberType) throw new GraphQLError(`MemberType o ID ${dto.memberTypeId} nie został znaleziony.`);
      }
       // Nie pozwalamy na zmianę userId dla profilu
      // DTO ChangeProfileInput nie powinno zawierać userId, jeśli nie jest aktualizowalne.
      // const { userId, ...restDto } = dto;
      // if (userId && userId !== existingProfile.userId) {
      //   throw new GraphQLError('Cannot change userId for an existing profile.');
      // }

      // Upewnij się, że dto nie zawiera userId, jeśli nie powinno być aktualizowane
      const updateData: Partial<ChangeProfileInput> = { ...dto };
      delete (updateData as any).userId; // Usuń userId z danych do aktualizacji, jeśli istnieje w DTO
      const updatedProfile = await context.prisma.profile.update({ where: { id }, data: updateData });
      context.loaders.profileLoader.clear(updatedProfile.userId).prime(updatedProfile.userId, updatedProfile);
      return updatedProfile;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new GraphQLError(`Profil o ID ${id} nie został znaleziony.`);
      }
      throw error;
    }
  },
  deleteProfile: async (_parent, { id }: { id: string }, context: GraphQLContext): Promise<Profile> => { // Zgodnie ze schematem docelowym zwraca Profile!
    try {
      const profile = await context.prisma.profile.findUnique({where: {id}});
      if (!profile) {
        throw new GraphQLError(`Profil o ID ${id} nie został znaleziony.`);
      }
      await context.prisma.profile.delete({ where: { id } });
      context.loaders.profileLoader.clear(profile.userId);
      return profile;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // Ten przypadek jest już obsłużony przez sprawdzenie findUnique powyżej,
        // ale warto o tym pamiętać dla innych wzorców usuwania.
        throw new GraphQLError(`Profil o ID ${id} nie został znaleziony.`);
      }
      throw error;
    }
  },

  subscribeTo: async (_parent, { userId, authorId }: { userId: string, authorId: string }, context: GraphQLContext): Promise<User> => { // Zgodnie ze schematem docelowym zwraca User (nullable)
    if (userId === authorId) {
      throw new GraphQLError("Użytkownik nie może subskrybować samego siebie.");
    }

    const [user, author] = await Promise.all([
      context.loaders.userLoader.load(userId),
      context.loaders.userLoader.load(authorId),
    ]);

    if (!user) throw new GraphQLError(`Subskrybujący użytkownik o ID ${userId} nie został znaleziony.`);
    if (!author) throw new GraphQLError(`Autor o ID ${authorId} nie został znaleziony.`);

    try {
      await context.prisma.subscribersOnAuthors.create({
        data: { subscriberId: userId, authorId: authorId },
      });
      context.loaders.userSubscriptionsLoader.clear(userId);
      context.loaders.userSubscribersLoader.clear(authorId);
      return user; // Zwróć użytkownika, który zainicjował subskrypcję
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new GraphQLError(`Użytkownik ${userId} już subskrybuje autora ${authorId}.`);
      }
      throw error;
    }
  },

  unsubscribeFrom: async (_parent, { userId, authorId }: { userId: string, authorId: string }, context: GraphQLContext): Promise<User> => { // Zgodnie ze schematem docelowym zwraca User (nullable)
    const user = await context.loaders.userLoader.load(userId);
    if (!user) throw new GraphQLError(`Użytkownik o ID ${userId} nie został znaleziony.`);
    // Nie ma potrzeby sprawdzania, czy autor istnieje, ponieważ deleteMany nie rzuci błędu, jeśli rekord nie istnieje.

    await context.prisma.subscribersOnAuthors.deleteMany({ // Użyj deleteMany na wypadek, gdyby klucz główny nie został znaleziony przez delete (chociaż powinien)
        where: { subscriberId: userId, authorId: authorId },
    });
    // deleteMany nie rzuca P2025, jeśli żadne rekordy nie zostaną usunięte.
    // Aby upewnić się, że subskrypcja istniała, można dodać findFirst przed usunięciem.
    // Jednak w przypadku anulowania subskrypcji często dopuszczalne jest, jeśli rekord nie istniał.

    context.loaders.userSubscriptionsLoader.clear(userId);
    context.loaders.userSubscribersLoader.clear(authorId);
    return user; // Zwróć użytkownika, który zainicjował anulowanie subskrypcji
  },
};