import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql } from 'graphql';
import { createResolvers } from './resolvers.js';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { depthLimitMiddleware } from './middleware.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const resolvers = createResolvers(fastify);

  fastify.addHook('preHandler', depthLimitMiddleware);

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

      return await graphql({
        schema,
        source: query,
        rootValue: resolvers,
        variableValues: variables,
      })
    },
  });
};

export default plugin;
