import Fastify from 'fastify';
import { graphqlRoute } from './routes/graphql/index.js';

const server = Fastify({
  logger: true,
});

server.register(graphqlRoute);

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 