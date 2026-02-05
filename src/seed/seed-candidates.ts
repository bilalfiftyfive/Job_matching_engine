/* seed/seed-candidates.ts */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const pool = new Pool({ connectionString });
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const skillsPool = ['node', 'java', 'react', 'sql', 'aws'];

async function seed() {
  console.log('🌱 Seeding candidates...');

  const BATCH_SIZE = 500;
  const TOTAL = 10_000;

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batch = Array.from({ length: BATCH_SIZE }).map(() => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      skills: faker.helpers.arrayElements(skillsPool, 3),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      experienceYears: faker.number.int({ min: 0, max: 15 }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      location: faker.location.city(),
    }));

    await prisma.candidate.createMany({
      data: batch,
      skipDuplicates: true,
    });

    console.log(`✅ Seeded ${Math.min(i + BATCH_SIZE, TOTAL)} candidates`);
  }

  console.log('🎉 Seeding completed');
}

seed()
  .catch((err) => {
    console.error('❌ Seeding failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await pool.end();
  });
