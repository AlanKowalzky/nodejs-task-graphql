# GraphQL Service

Serwis GraphQL zbudowany przy użyciu Fastify, Prisma i TypeScript.

## Wymagania

- Node.js >= 18.0.0
- npm >= 9.0.0

## Instalacja

```bash
npm install
```

## Konfiguracja bazy danych

```bash
npx prisma migrate dev
npx prisma db seed
```

## Uruchomienie

```bash
# Tryb deweloperski
npm run dev

# Tryb produkcyjny
npm start
```

## Testy

```bash
npm test
```

## Endpointy

### GraphQL

- URL: `http://localhost:3000/graphql`
- Metoda: POST
- Content-Type: application/json

Przykładowe zapytanie:

```graphql
query {
  users {
    id
    name
    balance
    posts {
      id
      title
      content
    }
    profile {
      id
      isMale
      yearOfBirth
      memberType {
        id
        discount
        monthPostsLimit
      }
    }
  }
}
```

## Struktura projektu

```
src/
  ├── routes/
  │   └── graphql/
  │       ├── schema/
  │       │   ├── types.ts
  │       │   ├── Query.ts
  │       │   ├── User.ts
  │       │   ├── Post.ts
  │       │   └── Profile.ts
  │       ├── plugins/
  │       │   ├── prisma.ts
  │       │   └── loaders.ts
  │       ├── context.ts
  │       ├── loaders.ts
  │       └── index.ts
  └── index.ts
```

## Funkcjonalności

- GraphQL API z obsługą zapytań i mutacji
- DataLoader do optymalizacji zapytań
- Prisma jako ORM
- TypeScript dla typowania
- Fastify jako serwer HTTP
- SQLite jako baza danych
