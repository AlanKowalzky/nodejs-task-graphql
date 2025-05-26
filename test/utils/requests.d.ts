import { FastifyInstance } from 'fastify';
import { Static } from '@sinclair/typebox';
import { createGqlResponseSchema } from '../../src/routes/graphql/schemas.js';
import { MemberTypeId } from '../../src/routes/member-types/schemas.js';
export declare function gqlQuery(app: FastifyInstance, dto: Static<(typeof createGqlResponseSchema)['body']>): Promise<{
    res: import("light-my-request").Response;
    body: {
        data?: any;
        errors?: any;
    };
}>;
export declare function getUsers(app: FastifyInstance): Promise<{
    res: import("light-my-request").Response;
    body: {
        name: string;
        id: string;
        balance: number;
    }[];
}>;
export declare function getProfiles(app: FastifyInstance): Promise<{
    res: import("light-my-request").Response;
    body: {
        id: string;
        isMale: boolean;
        yearOfBirth: number;
        userId: string;
        memberTypeId: string;
    }[];
}>;
export declare function getPosts(app: FastifyInstance): Promise<{
    res: import("light-my-request").Response;
    body: {
        content: string;
        title: string;
        id: string;
        authorId: string;
    }[];
}>;
export declare function getMemberTypes(app: FastifyInstance): Promise<{
    res: import("light-my-request").Response;
    body: {
        id: string;
        discount: number;
        postsLimitPerMonth: number;
    }[];
}>;
export declare function getUser(app: FastifyInstance, id: string): Promise<{
    res: import("light-my-request").Response;
    body: {
        name: string;
        id: string;
        balance: number;
    };
}>;
export declare function getProfile(app: FastifyInstance, id: string): Promise<{
    res: import("light-my-request").Response;
    body: {
        id: string;
        isMale: boolean;
        yearOfBirth: number;
        userId: string;
        memberTypeId: string;
    };
}>;
export declare function getPost(app: FastifyInstance, id: string): Promise<{
    res: import("light-my-request").Response;
    body: {
        content: string;
        title: string;
        id: string;
        authorId: string;
    };
}>;
export declare function getMemberType(app: FastifyInstance, id: string): Promise<{
    res: import("light-my-request").Response;
    body: {
        id: string;
        discount: number;
        postsLimitPerMonth: number;
    };
}>;
export declare function createUser(app: FastifyInstance): Promise<{
    res: import("light-my-request").Response;
    body: {
        name: string;
        id: string;
        balance: number;
    };
}>;
export declare function createProfile(app: FastifyInstance, userId: string, memberTypeId: MemberTypeId): Promise<{
    res: import("light-my-request").Response;
    body: {
        id: string;
        isMale: boolean;
        yearOfBirth: number;
        userId: string;
        memberTypeId: string;
    };
}>;
export declare function createPost(app: FastifyInstance, authorId: string): Promise<{
    res: import("light-my-request").Response;
    body: {
        content: string;
        title: string;
        id: string;
        authorId: string;
    };
}>;
export declare function subscribeTo(app: FastifyInstance, userId: string, authorId: string): Promise<{
    res: import("light-my-request").Response;
    body: {};
}>;
export declare function subscribedToUser(app: FastifyInstance, userId: string): Promise<{
    res: import("light-my-request").Response;
    body: {
        name: string;
        id: string;
        balance: number;
    }[];
}>;
export declare function unsubscribeFrom(app: FastifyInstance, userId: string, authorId: string): Promise<{
    res: import("light-my-request").Response;
    body: {};
}>;
export declare function getPrismaStats(app: FastifyInstance): Promise<{
    res: import("light-my-request").Response;
    body: {
        operationHistory: {
            model: string;
            operation: string;
            args: any;
        }[];
    };
}>;
