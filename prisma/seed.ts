import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Admin Accounts
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Create admin account
  await prisma.admin.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      password: adminPassword,
    },
  });

  // 2. Create Sample Events
  const events = [
    {
      id: '1',
      name: 'Hindia Baskara',
      description:
        'Festival musik terbesar tahun ini menghadirkan deretan artis papan atas Indonesia dan internasional. Nikmati pengalaman konser yang tak terlupakan dengan stage megah, sound system berkualitas tinggi, dan atmosfer yang luar biasa. Lebih dari 20 artis akan tampil dalam 2 hari penuh keseruan!',
      date: new Date('2026-08-15T19:00:00Z'),
      time: '14:00',
      venue: 'Gelora Bung Karno',
      city: 'Jakarta',
      category: 'Festival',
      poster: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1000&fit=crop',
      ticketCategories: {
        create: [
          { id: 'tc1', name: 'Festival Pass (2 Hari)', price: 1500000, quota: 5000, sold: 3200 },
          { id: 'tc2', name: 'VIP Pass (2 Hari)', price: 3500000, quota: 1000, sold: 750 },
          { id: 'tc3', name: 'VVIP Pass (2 Hari)', price: 7500000, quota: 200, sold: 180 },
        ],
      },
      status: 'PUBLISHED',
    },
    {
      id: '2',
      name: 'Tulus - Manusia World Tour',
      description: 'Konser tur dunia Tulus dengan album terbaru "Manusia". Rasakan kehangatan musik Tulus dengan aransemen orkestra penuh dan setlist spesial yang mencakup lagu-lagu hit serta lagu baru.',
      date: new Date('2026-09-20T19:00:00Z'),
      time: '19:00',
      venue: 'Indonesia Convention Exhibition (ICE)',
      city: 'Tangerang',
      category: 'Pop',
      poster: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=1000&fit=crop',
      ticketCategories: {
        create: [
          { id: 'tc4', name: 'CAT 1', price: 1250000, quota: 3000, sold: 2800 },
          { id: 'tc5', name: 'CAT 2', price: 850000, quota: 5000, sold: 3500 },
          { id: 'tc6', name: 'CAT 3', price: 450000, quota: 7000, sold: 4200 },
        ],
      },
      status: 'PUBLISHED',
    },
    {
      id: '3',
      name: 'Dewa 19 Reunion Concert',
      description: 'Konser reuni legendaris Dewa 19 dengan formasi lengkap! Saksikan performa epic dari band rock terbesar Indonesia yang akan membawakan hits sepanjang masa.',
      date: new Date('2026-10-05T19:30:00Z'),
      time: '19:30',
      venue: 'Stadion Utama Gelora Bung Karno',
      city: 'Jakarta',
      category: 'Rock',
      poster: 'https://plus.unsplash.com/premium_photo-1664303677453-ca2ad8f7dd8d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGtvbnNlcnxlbnwwfHwwfHx8MA%3D%3D',
      ticketCategories: {
        create: [
          { id: 'tc7', name: 'Tribune', price: 350000, quota: 20000, sold: 15000 },
          { id: 'tc8', name: 'Festival', price: 750000, quota: 10000, sold: 7500 },
          { id: 'tc9', name: 'VIP', price: 2000000, quota: 2000, sold: 1800 },
        ],
      },
      status: 'PUBLISHED',
    },
    {
      id: '4',
      name: 'Raisa - Kali Kedua Live',
      description: 'Raisa kembali dengan konser akustik intimate. Dengarkan suara merdu Raisa lebih dekat dalam setting yang hangat dan personal.',
      date: new Date('2026-11-12T20:00:00Z'),
      time: '20:00',
      venue: 'The Kasablanka Hall',
      city: 'Jakarta',
      category: 'Pop',
      poster: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=1000&fit=crop',
      ticketCategories: {
        create: [
          { id: 'tc10', name: 'Regular', price: 500000, quota: 2000, sold: 1200 },
          { id: 'tc11', name: 'Premium', price: 1000000, quota: 800, sold: 600 },
          { id: 'tc12', name: 'VVIP (Meet & Greet)', price: 3000000, quota: 100, sold: 85 },
        ],
      },
      status: 'PUBLISHED',
    },
    {
      id: '5',
      name: 'Java Jazz Festival 2026',
      description: 'Festival jazz internasional terbesar di Asia Tenggara. Lebih dari 100 penampilan dari musisi jazz lokal dan internasional selama 3 hari berturut-turut.',
      date: new Date('2026-08-15T19:00:00Z'),
      time: '12:00',
      venue: 'JIExpo Kemayoran',
      city: 'Jakarta',
      category: 'Jazz',
      poster: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=1000&fit=crop',
      ticketCategories: {
        create: [
          { id: 'tc13', name: 'Daily Pass', price: 600000, quota: 8000, sold: 3000 },
          { id: 'tc14', name: '3 Day Pass', price: 1500000, quota: 3000, sold: 1200 },
          { id: 'tc15', name: 'VIP 3 Day Pass', price: 4000000, quota: 500, sold: 200 },
        ],
      },
      status: 'PUBLISHED',
    },
    {
      id: '6',
      name: 'Sheila On 7 - Anniversary Tour',
      description: 'Perayaan 30 tahun berkarya Sheila On 7 dengan tur keliling Indonesia. Nikmati lagu-lagu nostalgia yang menemani generasi.',
      date: new Date('2026-10-25T19:00:00Z'),
      time: '19:00',
      venue: 'Sasana Budaya Ganesha (Sabuga)',
      city: 'Bandung',
      category: 'Pop Rock',
      poster: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=1000&fit=crop',
      ticketCategories: {
        create: [
          { id: 'tc16', name: 'Regular', price: 250000, quota: 3000, sold: 2500 },
          { id: 'tc17', name: 'VIP', price: 750000, quota: 1000, sold: 700 },
        ],
      },
      status: 'PUBLISHED',
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
