import { FastifyPluginAsync } from 'fastify';
import { graphql, parse, validate, specifiedRules, DocumentNode, GraphQLError, GraphQLSchema } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { graphqlSchema } from './schema/schema.js';
import loadersPlugin from './plugins/loaders.js';
import prismaPlugin from './plugins/prisma.js';

// Importujemy definicję kontekstu GraphQL
import { GraphQLContext } from './context.js';

// Importujemy funkcję do tworzenia DataLoaderów
// Zakładamy, że DataLoadery są tworzone na żądanie lub w ramach pluginu fastify
// i są dostępne w instancji fastify.
// Jeśli DataLoadery są tworzone per żądanie, można to zrobić w funkcji `context`.
// Dla uproszczenia, zakładamy, że są już dostępne w `fastify.loaders`.
// import { createLoaders } from './loaders.js'; // Jeśli loadery są tworzone tutaj

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

  fastify.post('/graphql', async (request, reply) => {
    const { query, variables } = request.body as { query: string; variables?: Record<string, unknown> };
    
    // Walidacja głębokości zapytania
    const depthValidation = depthLimit(5);
    const validationErrors = validate(graphqlSchema, parse(query), [depthValidation, ...specifiedRules]);
    
    if (validationErrors.length > 0) {
      return reply.code(400).send({ errors: validationErrors });
    }

    const result = await graphql({
      schema: graphqlSchema,
      source: query,
      variableValues: variables,
      contextValue: {
        prisma: fastify.prisma,
        loaders: fastify.loaders,
      },
    });

    return result;
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

export default graphqlPlugin;
