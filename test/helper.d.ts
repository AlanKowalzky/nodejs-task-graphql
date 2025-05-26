/// <reference types="node" resolution-mode="require"/>
import { FastifyInstance } from 'fastify';
import tap from 'tap';
export type Test = (typeof tap)['Test']['prototype'];
declare function config(): {};
declare function build(t: Test): Promise<FastifyInstance<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>>;
export { config, build };
