import { randomInt, randomUUID } from 'node:crypto';
export function genCreateUserDto() {
    return {
        name: randomUUID(),
        balance: randomInt(0, 100) + +Math.random().toFixed(3),
    };
}
export function genCreateProfileDto(userId, memberTypeId) {
    return {
        userId,
        memberTypeId,
        isMale: !randomInt(0, 2),
        yearOfBirth: randomInt(1950, 2000),
    };
}
export function genCreatePostDto(authorId) {
    return {
        authorId,
        content: randomUUID(),
        title: randomUUID(),
    };
}
//# sourceMappingURL=fake.js.map