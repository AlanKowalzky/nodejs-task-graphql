import DataLoader from 'dataloader';
import { PrismaClient, User, SubscribersOnAuthors, Post, Profile, MemberType } from '@prisma/client';
import { parseResolveInfo, ResolveTree } from 'graphql-parse-resolve-info';

type SubscribersOnAuthorsWithRelations = SubscribersOnAuthors & {
  author: User;
  subscriber: User;
};

export const createLoaders = (prisma: PrismaClient) => ({
  userLoader: new DataLoader<string, User | null>(async (ids: readonly string[]) => {
    console.log('Loading users for ids:', ids);
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(ids) } }
    });
    console.log('Found users:', users);
    return ids.map(id => users.find(user => user.id === id) || null);
  }),

  postLoader: new DataLoader<string, Post[]>(async (ids: readonly string[]) => {
    console.log('Loading posts for user ids:', ids);
    const posts = await prisma.post.findMany({
      where: { authorId: { in: Array.from(ids) } }
    });
    console.log('Found posts:', posts);
    const result = ids.map(id => posts.filter(post => post.authorId === id));
    console.log('Returning posts for each user:', result);
    return result;
  }),

  profileLoader: new DataLoader<string, Profile | null>(async (ids: readonly string[]) => {
    console.log('Loading profiles for user ids:', ids);
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: Array.from(ids) } }
    });
    console.log('Found profiles:', profiles);
    const result = ids.map(id => profiles.find(profile => profile.userId === id) || null);
    console.log('Returning profiles for each user:', result);
    return result;
  }),

  memberTypeLoader: new DataLoader<string, MemberType | null>(async (ids: readonly string[]) => {
    console.log('Loading member types for ids:', ids);
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: Array.from(ids) } }
    });
    console.log('Found member types:', memberTypes);
    const result = ids.map(id => memberTypes.find(memberType => memberType.id === id) || null);
    console.log('Returning member types for each id:', result);
    return result;
  }),

  userSubscriptionsLoader: new DataLoader<string, User[]>(async (ids: readonly string[]) => {
    console.log('Loading subscriptions for user ids:', ids);
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: { subscriberId: { in: Array.from(ids) } },
      include: { author: true }
    });
    console.log('Found subscriptions:', subscriptions);
    const result = ids.map(id => 
      subscriptions
        .filter(sub => sub.subscriberId === id)
        .map(sub => sub.author)
    );
    console.log('Returning subscriptions for each user:', result);
    return result;
  }),

  userSubscribersLoader: new DataLoader<string, User[]>(async (ids: readonly string[]) => {
    console.log('Loading subscribers for user ids:', ids);
    const subscribers = await prisma.subscribersOnAuthors.findMany({
      where: { authorId: { in: Array.from(ids) } },
      include: { subscriber: true }
    });
    console.log('Found subscribers:', subscribers);
    const result = ids.map(id => 
      subscribers
        .filter(sub => sub.authorId === id)
        .map(sub => sub.subscriber)
    );
    console.log('Returning subscribers for each user:', result);
    return result;
  })
});

export const shouldIncludeSubscriptions = (info: any) => {
  const fields = info.fieldNodes[0].selectionSet.selections;
  return fields.some((field: any) => 
    field.name.value === 'userSubscribedTo' || 
    field.name.value === 'subscribedToUser'
  );
};

export const getSubscriptionFields = (info: any) => {
  const fields = info.fieldNodes[0].selectionSet.selections;
  return {
    userSubscribedTo: fields.some((field: any) => field.name.value === 'userSubscribedTo'),
    subscribedToUser: fields.some((field: any) => field.name.value === 'subscribedToUser')
  };
};