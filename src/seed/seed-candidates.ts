/* seed/seed-candidates.ts */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const skillsPool = ['node', 'java', 'react', 'sql', 'aws'] as const;
type Skill = (typeof skillsPool)[number];
type CandidateSeed = {
  skills: Skill[];
  experienceYears: number;
  location: string;
};

async function seed() {
  console.log('🌱 Seeding candidates...');

  const BATCH_SIZE = 500;
  const TOTAL = 10_000;

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batch: CandidateSeed[] = Array.from({ length: BATCH_SIZE }).map(
      () => ({
        skills: faker.helpers.arrayElements(skillsPool, 3),
        experienceYears: faker.number.int({ min: 0, max: 15 }),
        location: faker.location.city(),
      }),
    );

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
    await pool.end();
  });
