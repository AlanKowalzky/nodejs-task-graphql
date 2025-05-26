import { createUserSchema } from '../../src/routes/users/schemas.js';
import { Static } from '@fastify/type-provider-typebox';
import { createProfileSchema } from '../../src/routes/profiles/schemas.js';
import { createPostSchema } from '../../src/routes/posts/schemas.js';
import { MemberTypeId } from '../../src/routes/member-types/schemas.js';
export declare function genCreateUserDto(): Static<(typeof createUserSchema)['body']>;
export declare function genCreateProfileDto(userId: string, memberTypeId: MemberTypeId): Static<(typeof createProfileSchema)['body']>;
export declare function genCreatePostDto(authorId: string): Static<(typeof createPostSchema)['body']>;
