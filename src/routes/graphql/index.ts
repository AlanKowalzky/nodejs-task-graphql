import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate, specifiedRules, GraphQLError } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { createLoaders } from './loaders.js';
import { schema } from './schema/schema.js'; // Importujemy zbudowany schemat
import { GraphQLContext } from './context.js';

const GQL_DEPTH_LIMIT = 5; // Limit głębokości zapytania GraphQL

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify; // Prisma client jest wstrzykiwany przez plugin fastify-prisma

  fastify.route({
    url: '/', // Endpoint będzie dostępny pod /graphql/ dzięki autoload
    method: 'POST',
    schema: {
      ...createGqlResponseSchema, // Definicja schematu dla walidacji żądania/odpowiedzi
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req, reply): Promise<unknown> {
      try {
        const { query, variables, operationName } = req.body as {
          query?: string;
          variables?: Record<string, unknown>;
          operationName?: string;
        };

        if (!query) {
          return reply.status(400).send({ errors: [{ message: 'Query is missing.' }] });
        }

        let documentAST;
        try {
          documentAST = parse(query);
        } catch (syntaxError: any) {
          return reply.status(400).send({ errors: [syntaxError] });
        }

        const validationRulesToApply = [
          ...specifiedRules,
          depthLimit(GQL_DEPTH_LIMIT, {}, (errors) => {
            fastify.log.warn(`GraphQL depth limit exceeded: ${errors.map(e => e.message).join(', ')}`);
          }),
        ];

        const validationErrors = validate(schema, documentAST, validationRulesToApply);
        if (validationErrors.length > 0) {
          return reply.status(400).send({ errors: validationErrors });
        }

        const contextValue: GraphQLContext = { prisma, loaders: createLoaders(prisma) };

        return graphql({
          schema,
          source: query,
          variableValues: variables,
          operationName,
          contextValue,
        });
      } catch (error: any) {
        fastify.log.error(error, 'Error processing GraphQL request');
        const errors: GraphQLError[] = error.errors || [new GraphQLError(error.message || 'An unexpected error occurred.')];
        const statusCode = error.statusCode || error.status || (error.errors ? 400 : 500);
        return reply.status(statusCode).send({ errors });
      }
    },
  });
};

export default plugin;
