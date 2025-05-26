import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList, GraphQLNonNull, GraphQLBoolean, GraphQLInt, GraphQLScalarType, Kind, GraphQLInputObjectType, GraphQLOutputType, GraphQLType, execute, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { createLoaders, shouldIncludeSubscriptions } from './loaders.js';
import { User, Post, Profile, MemberType } from '@prisma/client';
import { FastifyInstance, FastifyRequest } from 'fastify';

// Style configs
const GRAPHQL_CONFIG = {
  maxDepth: 5,
  maxComplexity: 100,
  maxCost: 1000,
  maxBatchSize: 100,
  cacheTTL: 3600,
  rateLimit: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};

// Definicja typu dla kontekstu GraphQL
interface GraphQLContext {
  prisma: any;
  loaders: ReturnType<typeof createLoaders>;
  req: FastifyRequest;
  requestId: string;
  timestamp: string;
  userAgent?: string;
  ip: string;
  fastify: FastifyInstance;
}

const UUIDType = new GraphQLScalarType({
  name: 'UUID',
  description: 'UUID custom scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});

const MemberTypeIdType = new GraphQLScalarType({
  name: 'MemberTypeId',
  description: 'MemberTypeId custom scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});

let PostType: GraphQLObjectType;
let UserType: GraphQLObjectType;

const MemberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: new GraphQLNonNull(MemberTypeIdType) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: MemberTypeType,
      resolve: async (parent, _, { loaders }) => {
        return loaders.memberTypeLoader.load(parent.memberTypeId);
      },
    },
  },
});

PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    author: {
      type: new GraphQLNonNull(UserType),
      resolve: async (parent, _, { loaders }) => {
        return loaders.userLoader.load(parent.authorId);
      },
    },
  }),
});

UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: async (parent: User, _: any, context: GraphQLContext) => {
        context.fastify.log.debug({
          requestId: context.requestId,
          operation: 'getUserProfile',
          userId: parent.id,
          timestamp: context.timestamp,
        });
        return context.loaders.profileLoader.load(parent.id);
      },
    },
    posts: {
      type: new GraphQLList(PostType) as GraphQLOutputType,
      resolve: async (parent: User, _: any, context: GraphQLContext) => {
        context.fastify.log.debug({
          requestId: context.requestId,
          operation: 'getUserPosts',
          userId: parent.id,
          timestamp: context.timestamp,
        });
        return context.loaders.postLoader.load(parent.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType) as GraphQLOutputType,
      resolve: async (parent: User, _: any, context: GraphQLContext, info: any) => {
        if (!shouldIncludeSubscriptions(info)) {
          return [];
        }
        context.fastify.log.debug({
          requestId: context.requestId,
          operation: 'getUserSubscriptions',
          userId: parent.id,
          timestamp: context.timestamp,
        });
        return context.loaders.userSubscriptionsLoader.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType) as GraphQLOutputType,
      resolve: async (parent: User, _: any, context: GraphQLContext, info: any) => {
        if (!shouldIncludeSubscriptions(info)) {
          return [];
        }
        context.fastify.log.debug({
          requestId: context.requestId,
          operation: 'getUserSubscribers',
          userId: parent.id,
          timestamp: context.timestamp,
        });
        return context.loaders.userSubscribersLoader.load(parent.id);
      },
    },
  }),
});

const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

const CreatePostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
});

const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdType) },
  },
});

const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

const ChangePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

const ChangeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeIdType },
  },
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      memberTypes: {
        type: new GraphQLList(MemberTypeType),
        resolve: async (_, __, { prisma }) => {
          return prisma.memberType.findMany();
        },
      },
      memberType: {
        type: MemberTypeType,
        args: {
          id: { type: new GraphQLNonNull(MemberTypeIdType) },
        },
        resolve: async (_, { id }, { loaders }) => {
          return loaders.memberTypeLoader.load(id);
        },
      },
      posts: {
        type: new GraphQLList(PostType),
        resolve: async (_, __, { prisma }) => {
          return prisma.post.findMany();
        },
      },
      post: {
        type: PostType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { prisma }) => {
          return prisma.post.findUnique({
            where: { id },
          });
        },
      },
      users: {
        type: new GraphQLList(UserType),
        resolve: async (_, __, { prisma, loaders }) => {
          const users = await prisma.user.findMany();
          
          // Prime the userLoader with all users
          users.forEach(user => {
            loaders.userLoader.prime(user.id, user);
          });

          // Prime the postLoader with all posts
          const posts = await prisma.post.findMany();
          const postMap = new Map<string, Post[]>();
          posts.forEach(post => {
            const userPosts = postMap.get(post.authorId) || [];
            userPosts.push(post);
            postMap.set(post.authorId, userPosts);
          });
          postMap.forEach((userPosts, userId) => {
            loaders.postLoader.prime(userId, userPosts);
          });

          // Prime the profileLoader with all profiles
          const profiles = await prisma.profile.findMany();
          profiles.forEach(profile => {
            loaders.profileLoader.prime(profile.userId, profile);
          });

          // Prime the memberTypeLoader with all member types
          const memberTypes = await prisma.memberType.findMany();
          memberTypes.forEach(memberType => {
            loaders.memberTypeLoader.prime(memberType.id, memberType);
          });

          // Prime the subscription loaders
          const subscriptions = await prisma.subscribersOnAuthors.findMany({
            include: {
              author: true,
              subscriber: true,
            },
          });
          const subscriptionMap = new Map<string, User[]>();
          const subscriberMap = new Map<string, User[]>();
          subscriptions.forEach(sub => {
            const userSubscriptions = subscriptionMap.get(sub.subscriberId) || [];
            userSubscriptions.push(sub.author);
            subscriptionMap.set(sub.subscriberId, userSubscriptions);
            
            const userSubscribers = subscriberMap.get(sub.authorId) || [];
            userSubscribers.push(sub.subscriber);
            subscriberMap.set(sub.authorId, userSubscribers);
          });
          subscriptionMap.forEach((userSubscriptions, userId) => {
            loaders.userSubscriptionsLoader.prime(userId, userSubscriptions);
          });
          subscriberMap.forEach((userSubscribers, userId) => {
            loaders.userSubscribersLoader.prime(userId, userSubscribers);
          });

          return users;
        },
      },
      user: {
        type: UserType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { prisma, loaders }) => {
          const user = await prisma.user.findUnique({
            where: { id },
            include: {
              userSubscribedTo: {
                include: {
                  author: {
                    include: {
                      userSubscribedTo: {
                        include: { author: true },
                      },
                      subscribedToUser: {
                        include: { subscriber: true },
                      },
                    },
                  },
                },
              },
              subscribedToUser: {
                include: {
                  subscriber: {
                    include: {
                      userSubscribedTo: {
                        include: { author: true },
                      },
                      subscribedToUser: {
                        include: { subscriber: true },
                      },
                    },
                  },
                },
              },
            },
          });

          if (!user) {
            return null;
          }

          // Funkcja rekurencyjna do primowania loaderów dla użytkownika i jego powiązań
          function primeUserAndRelations(u) {
            if (!u || !u.id) return;
            
            // Prime userLoader
            if (!loaders.userLoader._promiseCache.has(u.id)) {
              loaders.userLoader.prime(u.id, u);
            }

            // Prime userSubscriptionsLoader
            if (u.userSubscribedTo) {
              const userSubscriptions = u.userSubscribedTo.map(sub => sub.author);
              loaders.userSubscriptionsLoader.prime(u.id, userSubscriptions);
              userSubscriptions.forEach(primeUserAndRelations);
            }

            // Prime userSubscribersLoader
            if (u.subscribedToUser) {
              const userSubscribers = u.subscribedToUser.map(sub => sub.subscriber);
              loaders.userSubscribersLoader.prime(u.id, userSubscribers);
              userSubscribers.forEach(primeUserAndRelations);
            }
          }

          // Prime the main user and all related users
          primeUserAndRelations(user);

          // Return the user with the correct structure
          return {
            ...user,
            userSubscribedTo: user.userSubscribedTo.map(sub => sub.author),
            subscribedToUser: user.subscribedToUser.map(sub => sub.subscriber),
          };
        },
      },
      profiles: {
        type: new GraphQLList(ProfileType),
        resolve: async (_, __, { prisma }) => {
          return prisma.profile.findMany();
        },
      },
      profile: {
        type: ProfileType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { prisma }) => {
          return prisma.profile.findUnique({
            where: { id },
          });
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createUser: {
        type: UserType,
        args: {
          dto: { type: new GraphQLNonNull(CreateUserInputType) },
        },
        resolve: async (_, { dto }, { prisma }) => {
          return prisma.user.create({
            data: dto,
          });
        },
      },
      createPost: {
        type: PostType,
        args: {
          dto: { type: new GraphQLNonNull(CreatePostInputType) },
        },
        resolve: async (_, { dto }, { prisma }) => {
          return prisma.post.create({
            data: dto,
          });
        },
      },
      createProfile: {
        type: ProfileType,
        args: {
          dto: { type: new GraphQLNonNull(CreateProfileInputType) },
        },
        resolve: async (_, { dto }, { prisma }) => {
          return prisma.profile.create({
            data: dto,
          });
        },
      },
      deleteUser: {
        type: GraphQLBoolean,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { prisma }) => {
          await prisma.user.delete({
            where: { id },
          });
          return true;
        },
      },
      deletePost: {
        type: GraphQLBoolean,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { prisma }) => {
          await prisma.post.delete({
            where: { id },
          });
          return true;
        },
      },
      deleteProfile: {
        type: GraphQLBoolean,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }, { prisma }) => {
          await prisma.profile.delete({
            where: { id },
          });
          return true;
        },
      },
      changeUser: {
        type: UserType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeUserInputType) },
        },
        resolve: async (_, { id, dto }, { prisma }) => {
          return prisma.user.update({
            where: { id },
            data: dto,
          });
        },
      },
      changePost: {
        type: PostType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangePostInputType) },
        },
        resolve: async (_, { id, dto }, { prisma }) => {
          return prisma.post.update({
            where: { id },
            data: dto,
          });
        },
      },
      changeProfile: {
        type: ProfileType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
        },
        resolve: async (_, { id, dto }, { prisma }) => {
          return prisma.profile.update({
            where: { id },
            data: dto,
          });
        },
      },
      subscribeTo: {
        type: GraphQLBoolean,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { userId, authorId }, { prisma }) => {
          await prisma.subscribersOnAuthors.create({
            data: {
              subscriberId: userId,
              authorId,
            },
          });
          return true;
        },
      },
      unsubscribeFrom: {
        type: GraphQLBoolean,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { userId, authorId }, { prisma }) => {
          await prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: userId,
                authorId,
              },
            },
          });
          return true;
        },
      },
    },
  }),
});

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;
  const loaders = createLoaders(prisma);

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      const document = parse(query);
      const validationErrors = validate(schema, document, [
        depthLimit(GRAPHQL_CONFIG.maxDepth),
      ]);
      
      if (validationErrors.length > 0) {
        return { errors: validationErrors };
      }

      const context: GraphQLContext = {
        prisma,
        loaders,
        req,
        requestId: req.id,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        fastify,
      };

      const result = await execute({
        schema,
        document,
        variableValues: variables,
        contextValue: context,
      });

      fastify.log.info({
        requestId: req.id,
        query: query,
        variables: variables,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        errors: result.errors,
      });

      return result;
    },
  });
};

// Funkcje pomocnicze do obliczania złożoności i kosztu zapytania
function calculateQueryComplexity(document: any): number {
  // Implementacja obliczania złożoności zapytania
  return 0; // TODO: Implement
}

function calculateQueryCost(document: any): number {
  // Implementacja obliczania kosztu zapytania
  return 0; // TODO: Implement
}

export default plugin;
