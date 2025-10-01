# Demo NestJS Project

A NestJS application with PostgreSQL, Prisma ORM, and JWT authentication.

## Quick Start

Create `.env` file by copying `.env.example` and fill in the values.

```bash
# 1. Install dependencies
yarn install

# 2. Start database
docker-compose up -d

# 3. Run migrations
yarn prisma:migrate

# 4. Generate Prisma client
yarn prisma:generate

# 5. Seed database
yarn prisma:seed

# 6. Start application
yarn start:dev
```

## Essential Commands

### Generate JWT Token

```bash
# Generate token for a user
yarn generate-jwt john.doe@example.com

# Or use shell script
./scripts/generate-token.sh john.doe@example.com
```

## Environment Variables

Use .env.example as reference for the environment variables .env file.

## TODO

- [ ] Add tests
- [ ] Add logic
-

## Improvements

- use websockets for faster conenction
- use custom Errors/Exceptions and error handling
- add types to repository returns
- score is right now calculated while getting response and not store in DB because logic can change or be fluent in different games so that is why i dont want to sotre it in DB. Additionally it is very fast to calculate it in the service layer so no need to store it in DB for now.
