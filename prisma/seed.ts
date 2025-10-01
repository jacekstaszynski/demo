import { PrismaClient } from '@prisma/client';
import console from 'console';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const testUsers = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
    },
    {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
    },
  ];

  await prisma.user.deleteMany({});
  console.log('🗑️  Cleared existing data');

  await Promise.all(
    testUsers.map(async (userData) => {
      const user = await prisma.user.create({
        data: userData,
      });

      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }),
  );

  console.log('🎉 Database seeding completed successfully!');
  console.log(`📊 Created ${testUsers.length} users`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
