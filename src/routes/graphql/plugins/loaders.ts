import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { createLoaders } from '../loaders.js';

const loadersPlugin: FastifyPluginAsync = async (fastify) => {
  const loaders = createLoaders(fastify.prisma);
  fastify.decorate('loaders', loaders);
};

export default fp(loadersPlugin, {
  name: 'loaders-plugin',
  dependencies: ['prisma'],
}); 