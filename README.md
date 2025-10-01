# Demo NestJS Project

A NestJS application with PostgreSQL, Prisma ORM, and JWT authentication.

## Quick Start

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

## License

MIT

## TODO

- [ ] Add tests
- [ ] Add logic
-
