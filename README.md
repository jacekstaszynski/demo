# Demo NestJS Project

A NestJS application with PostgreSQL, Prisma ORM, and JWT authentication.

## Quick Start

Create `.env` file by copying `.env.example` and fill in the values.

```bash
# 1. Install dependencies
yarn install

# 2. Start database
docker-compose up -d

# 3. Generate Prisma client
yarn prisma:generate

# 4. Run migrations
yarn prisma:migrate


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

## Improvements

- most of the code is over engineered to show more production based code, for such small up multiple features are not needed
- use websockets for faster conenction (potential)
- instead of session guard use db validation, for better performance (potential)
- add indexes and other optimizations to DB to increase performance (potential)
- score is right now calculated while getting response and not store in DB because logic can change or be fluent in different games so that is why i dont want to sotre it in DB. Additionally it is very fast to calculate it in the service layer so no need to store it in DB for now

#### DETAILS

- expand error handling with custom exceptions
- adjust eslint for test
- add types to repository returns
