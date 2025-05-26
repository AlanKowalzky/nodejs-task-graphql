import { FastifyRequest, FastifyReply } from 'fastify';
import depthLimit from 'graphql-depth-limit';

export const depthLimitMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const { query } = request.body as { query: string };
  const depth = depthLimit(5);
  const errors = depth({ document: query } as any);
  if (errors.length > 0) {
    return reply.code(400).send({ errors });
  }
}; 