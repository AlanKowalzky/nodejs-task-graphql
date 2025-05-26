import { FastifyPluginAsync } from 'fastify';
import { graphql, parse, validate, specifiedRules, DocumentNode, GraphQLError, GraphQLSchema } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { graphqlSchema } from './schema/schema.js';
import loadersPlugin from './plugins/loaders.js';
import prismaPlugin from './plugins/prisma.js';
import { FastifyInstance } from 'fastify';
import { createLoaders } from './loaders.js';
import { PrismaClient } from '@prisma/client';

// Importujemy definicję kontekstu GraphQL
import { GraphQLContext } from './context.js';

// Definicja typu dla ciała żądania GraphQL
interface GraphQLRequestBody {
  query?: string;
  variables?: { readonly [key: string]: unknown }; // Zgodnie z typem w graphql-js
  operationName?: string;
}

const graphqlPlugin: FastifyPluginAsync = async (fastify) => {
  // Rejestrujemy plugin Prisma przed pluginem loaders
  await fastify.register(prismaPlugin);
  await fastify.register(loadersPlugin);

  const prisma = new PrismaClient();
  const loaders = createLoaders(prisma);

  fastify.post('/graphql', async (request, reply) => {
    const { query, variables } = request.body as { query: string; variables?: Record<string, unknown> };

    try {
      const document = parse(query);
      const validationErrors = validate(graphqlSchema, document, [depthLimit(5)]);

      if (validationErrors.length > 0) {
        return reply.code(400).send({ errors: validationErrors });
      }

      const result = await graphql({
        schema: graphqlSchema,
        source: query,
        variableValues: variables,
        contextValue: {
          prisma,
          loaders,
        },
      });

      return result;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // Endpoint do GraphiQL
  fastify.get('/graphiql', async (request, reply) => {
    reply.type('text/html').send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GraphiQL</title>
          <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
        </head>
        <body style="margin: 0;">
          <div id="graphiql" style="height: 100vh;"></div>
          <script src="https://unpkg.com/graphiql/graphiql.min.js"></script>
          <script>
            const fetcher = GraphiQL.createFetcher({
              url: '/graphql',
            });
            ReactDOM.render(
              React.createElement(GraphiQL, { fetcher: fetcher }),
              document.getElementById('graphiql'),
            );
          </script>
        </body>
      </html>
    `);
  });

  // Upewnij się, że klient Prisma i DataLoadery są dostępne
  if (!fastify.prisma) {
    fastify.log.error('Prisma client (fastify.prisma) is not available on Fastify instance. Ensure prisma plugin is loaded.');
    throw new Error('Server configuration error: Prisma client not found.');
  }
  if (typeof fastify.loaders !== 'object' || fastify.loaders === null) {
    fastify.log.error('DataLoaders (fastify.loaders) are not available or not an object. Ensure loaders plugin is loaded.');
    throw new Error('Server configuration error: DataLoaders not found.');
  }
};

export const graphqlRoute = graphqlPlugin;
export default graphqlPlugin;
