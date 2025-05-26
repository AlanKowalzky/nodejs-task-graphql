import { Type } from '@fastify/type-provider-typebox';
import { buildSchema } from 'graphql';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

export const schema = buildSchema(`
  scalar UUID

  input ChangePostInput {
    title: String
    content: String
  }
    
  input ChangeProfileInput {
    isMale: Boolean
    yearOfBirth: Int
    memberTypeId: MemberTypeId
  }
    
  input ChangeUserInput {
    name: String
    balance: Float
  }
    
  input CreatePostInput {
    title: String!
    content: String!
    authorId: UUID!
  }
    
  input CreateProfileInput {
    isMale: Boolean!
    yearOfBirth: Int!
    userId: UUID!
    memberTypeId: MemberTypeId!
  }
    
  input CreateUserInput {
    name: String!
    balance: Float!
  }
    
  type MemberType {
    id: MemberTypeId!
    discount: Float!
    postsLimitPerMonth: Int!
  }
    
  enum MemberTypeId {
    BASIC
    BUSINESS
  }
    
  type Post {
    id: UUID!
    title: String!
    content: String!
  }
    
  type Profile {
    id: UUID!
    isMale: Boolean!
    yearOfBirth: Int!
    memberType: MemberType!
  }
    
  type User {
    id: UUID!
    name: String!
    balance: Float!
    profile: Profile
    posts: [Post!]!
    userSubscribedTo: [User!]!
    subscribedToUser: [User!]!
  }

  type Query {
    memberTypes: [MemberType!]!
    memberType(id: MemberTypeId!): MemberType
    users: [User!]!
    user(id: UUID!): User
    posts: [Post!]!
    post(id: UUID!): Post
    profiles: [Profile!]!
    profile(id: UUID!): Profile
  }
`); 