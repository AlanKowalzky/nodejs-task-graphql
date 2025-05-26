// Interfejsy DTO dla typów wejściowych mutacji
// Nazwy i pola powinny odpowiadać definicjom GraphQLInputObjectType w pliku types.ts
// oraz docelowemu schematowi schema.graphql.

export interface CreateUserInput {
  name: string;
  balance: number;
  // Zgodnie ze schematem Prisma, 'email' nie jest bezpośrednio w User,
  // ale jeśli Twój schemat GraphQL dla CreateUserInput go wymaga, dodaj go tutaj.
  // email?: string;
}

export interface UpdateUserInput {
  name?: string;
  balance?: number;
  // email?: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  authorId: string; // UUID autora
}

export interface ChangePostInput {
  title?: string;
  content?: string;
  // Zgodnie z docelowym schema.graphql, ChangePostInput nie zawiera authorId.
  // Jeśli miałoby zawierać, dodaj: authorId?: string;
}

export interface CreateProfileInput {
  isMale: boolean;
  yearOfBirth: number;
  userId: string; // UUID użytkownika, do którego należy profil
  memberTypeId: string; // ID typu członkostwa (np. 'basic', 'gold')
}

export interface ChangeProfileInput {
  isMale?: boolean;
  yearOfBirth?: number;
  memberTypeId?: string; // ID typu członkostwa
}