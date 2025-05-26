import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import mercurius, { MercuriusContext } from 'mercurius';
import depthLimit from 'graphql-depth-limit';

// Importujemy nasz zbudowany schemat
import { schema } from './schema/schema.js';

// Importujemy definicję kontekstu GraphQL
import { GraphQLContext } from './context.js';

// Importujemy funkcję do tworzenia DataLoaderów
// Zakładamy, że DataLoadery są tworzone na żądanie lub w ramach pluginu fastify
// i są dostępne w instancji fastify.
// Jeśli DataLoadery są tworzone per żądanie, można to zrobić w funkcji `context`.
// Dla uproszczenia, zakładamy, że są już dostępne w `fastify.loaders`.
// import { createLoaders } from './loaders.js'; // Jeśli loadery są tworzone tutaj

const graphqlPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(mercurius, {
    schema, // Używamy naszego zaimportowanego schematu
    graphiql: true, // Włącz GraphiQL dla łatwego testowania
    // Typowanie kontekstu Mercuriusa dla lepszej integracji z TypeScript
    context: (
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<GraphQLContext> | GraphQLContext => {
      // Tutaj tworzymy i zwracamy obiekt kontekstu,
      // który będzie dostępny w każdym resolverze.
      // Zakładamy, że klient Prisma i DataLoadery są już dołączone
      // do instancji Fastify przez inne pluginy (np. w src/plugins).
      if (!fastify.prisma) {
        throw new Error('Prisma client is not available on Fastify instance.');
      }
      if (!fastify.loaders) {
        // Jeśli DataLoadery miałyby być tworzone per żądanie:
        // const loaders = createLoaders(fastify.prisma);
        // return { prisma: fastify.prisma, loaders };
        throw new Error('DataLoaders are not available on Fastify instance.');
      }

      return {
        prisma: fastify.prisma,
        loaders: fastify.loaders,
        // Możesz tutaj dodać inne elementy do kontekstu, np. request, reply, jeśli potrzebne
        // request,
        // reply,
      };
    },
    validationRules: [
      // Dodajemy regułę ograniczającą głębokość zapytań
      // Ustawiamy limit na 5 zgodnie z wymaganiami zadania
      depthLimit(5, {
        // Opcjonalnie: można zignorować pewne pola, jeśli jest taka potrzeba
        // ignore: [/_trusted$/, 'internalField'],
      }),
    ],
    // Możesz dodać własny errorHandler, jeśli chcesz inaczej obsługiwać błędy GraphQL
    // errorHandler: (error, request, reply) => {
    //   reply.log.error(error);
    //   // Domyślnie mercurius wysyła błędy w formacie GraphQL
    //   // Możesz zmodyfikować odpowiedź, jeśli jest taka potrzeba
    //   return {
    //     statusCode: error.statusCode || 500,
    //     response: {
    //       errors: error.errors || [{ message: error.message }],
    //     },
    //   };
    // },
  });
};

export default graphqlPlugin;
