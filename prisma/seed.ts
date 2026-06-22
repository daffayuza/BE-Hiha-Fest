import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@hahahihifest.com' },
    update: {},
    create: {
      email: 'admin@hahahihifest.com',
      password: adminPassword,
    },
  });

  // 2. Create Sample Events
  const events = [
    {
      name: 'Jazz Night Festival 2026',
      description: 'A night of smooth jazz with international artists.',
      date: new Date('2026-08-15T19:00:00Z'),
      time: '19:00',
      venue: 'Jakarta International Expo',
      city: 'Jakarta',
      category: 'Jazz',
      poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      status: 'PUBLISHED',
      ticketCategories: {
        create: [
          { name: 'VIP', price: 1500000, quota: 100 },
          { name: 'General Admission', price: 500000, quota: 500 },
        ],
      },
    },
    {
      name: 'Rock Evolution 2026',
      description: 'The biggest rock festival in Asia.',
      date: new Date('2026-09-20T16:00:00Z'),
      time: '16:00',
      venue: 'Stadion Utama Gelora Bung Karno',
      city: 'Jakarta',
      category: 'Rock',
      poster: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=800&q=80',
      status: 'PUBLISHED',
      ticketCategories: {
        create: [
          { name: 'Festival A', price: 850000, quota: 1000 },
          { name: 'Festival B', price: 450000, quota: 2000 },
          { name: 'Tribune', price: 300000, quota: 5000 },
        ],
      },
    },
  ];

  for (const event of events) {
    await prisma.event.create({
      data: event,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
