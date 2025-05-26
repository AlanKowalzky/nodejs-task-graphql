import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import { UUIDType } from './uuid.js';
import { MemberTypeType } from './member-type.js';
import { UserType } from './user.js';
import { PostType } from './post.js';

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLString },
    yearOfBirth: { type: GraphQLString },
    memberTypeId: { type: UUIDType },
    memberType: {
      type: MemberTypeType,
      resolve: (profile) => profile.memberType,
    },
    userId: { type: UUIDType },
    user: {
      type: UserType,
      resolve: (profile) => profile.user,
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (profile) => profile.posts,
    },
  }),
}); 