import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  const prisma = new PrismaClient();

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (instance) => {
    await prisma.$disconnect();
  });
};

export default prismaPlugin; 