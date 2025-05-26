import { genCreatePostDto, genCreateProfileDto, genCreateUserDto } from './fake.js';
export async function gqlQuery(app, dto) {
    const res = await app.inject({
        url: `/graphql`,
        method: 'POST',
        body: dto,
    });
    const body = (await res.json());
    return { res, body };
}
export async function getUsers(app) {
    const res = await app.inject({
        url: `/users`,
        method: 'GET',
    });
    const body = (await res.json());
    return { res, body };
}
export async function getProfiles(app) {
    const res = await app.inject({
        url: `/profiles`,
        method: 'GET',
    });
    const body = (await res.json());
    return { res, body };
}
export async function getPosts(app) {
    const res = await app.inject({
        url: `/posts`,
        method: 'GET',
    });
    const body = (await res.json());
    return { res, body };
}
export async function getMemberTypes(app) {
    const res = await app.inject({
        url: `/member-types`,
        method: 'GET',
    });
    const body = (await res.json());
    return { res, body };
}
export async function getUser(app, id) {
    const res = await app.inject({
        url: `/users/${id}`,
        method: 'GET',
    });
    const body = (await res.json());
    return { res, body };
}
export async function getProfile(app, id) {
    const res = await app.inject({
        url: `/profiles/${id}`,
        method: 'GET',
    });
    const body = (await res.json());
    return { res, body };
}
export async function getPost(app, id) {
    const res = await app.inject({
        url: `/posts/${id}`,
        method: 'GET',
    });
    const body = (await res.json());
    return { res, body };
}
export async function getMemberType(app, id) {
    const res = await app.inject({
        url: `/member-types/${id}`,
        method: 'GET',
    });
    const body = (await res.json());
    return { res, body };
}
export async function createUser(app) {
    const res = await app.inject({
        url: '/users',
        method: 'POST',
        payload: genCreateUserDto(),
    });
    const body = (await res.json());
    return { res, body };
}
export async function createProfile(app, userId, memberTypeId) {
    const res = await app.inject({
        url: '/profiles',
        method: 'POST',
        payload: genCreateProfileDto(userId, memberTypeId),
    });
    const body = (await res.json());
    return { res, body };
}
export async function createPost(app, authorId) {
    const res = await app.inject({
        url: '/posts',
        method: 'POST',
        payload: genCreatePostDto(authorId),
    });
    const body = (await res.json());
    return { res, body };
}
export async function subscribeTo(app, userId, authorId) {
    const res = await app.inject({
        url: `/users/${userId}/user-subscribed-to/`,
        method: 'POST',
        payload: {
            authorId,
        },
    });
    return { res, body: {} };
}
export async function subscribedToUser(app, userId) {
    const res = await app.inject({
        url: `/users/${userId}/subscribed-to-user`,
        method: 'GET',
    });
    const body = (await res.json());
    return { res, body };
}
export async function unsubscribeFrom(app, userId, authorId) {
    const res = await app.inject({
        url: `/users/${userId}/user-subscribed-to/${authorId}`,
        method: 'DELETE',
    });
    return { res, body: {} };
}
export async function getPrismaStats(app) {
    const res = await app.inject({
        url: '/stats/prisma',
        method: 'GET',
    });
    const body = (await res.json());
    return { res, body };
}
//# sourceMappingURL=requests.js.map