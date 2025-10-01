# Demo NestJS Project

A NestJS application with PostgreSQL, Prisma ORM, and JWT authentication,
made for PWD recruitment process.

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

## Generate JWT Token

```bash
# Generate token for a user
yarn generate-jwt john.doe@example.com

# Or use shell script
./scripts/generate-token.sh john.doe@example.com
```

## Improvements

- Most of the code is over-engineered to demonstrate production-ready patterns. For such a small application, multiple layers and features are not strictly necessary.
- Use WebSockets for faster connection (potential)
- Instead of session guard, use DB validation for better performance (potential)
- Add indexes and other optimizations to DB to increase performance (potential)
- Score is currently calculated on-the-fly when getting responses rather than stored in DB, because scoring logic may change or vary across different games. Additionally, it is very fast to calculate in the service layer, so storing it in DB is unnecessary for now

### Details

- Expand error handling with custom exceptions
- Adjust ESLint for test files
- Add types to repository returns
- and much more...
