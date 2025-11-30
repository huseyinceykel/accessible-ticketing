import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Önce temizlik yapalım (Eski verileri sil)
  await prisma.seat.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Veritabanı temizlendi. Veri ekleniyor...');

  // 1. Örnek Kullanıcı (Admin)
  await prisma.user.create({
    data: {
      email: 'huseyin@ornek.com',
      name: 'Hüseyin Eren',
      password: '123456password', // Not: Gerçekte hashlenmeli!
      role: 'ADMIN',
    },
  });

  // 2. Etkinlik Oluştur: DevFest 2025
  const event = await prisma.event.create({
    data: {
      title: 'DevFest Kastamonu 2025',
      description: 'Yazılım dünyasının kalbi Kastamonu\'da atıyor! Yapay zeka, Web teknolojileri ve daha fazlası.',
      date: new Date('2025-10-11T10:00:00Z'),
      location: 'Kastamonu Üniversitesi Merkez Kütüphanesi',
      price: 150.0,
      imageUrl: 'https://developers.google.com/static/community/gdg/images/logo-lockup-gdg-horizontal.png',
      isActive: true,
    },
  });

  // 3. Bu Etkinliğe Koltuklar Ekle (A, B, C Sıraları x 4 Koltuk)
  const rows = ['A', 'B', 'C'];
  for (const row of rows) {
    for (let i = 1; i <= 4; i++) {
      await prisma.seat.create({
        data: {
          label: `${row}${i}`, // A1, A2...
          price: row === 'A' ? 200 : 150, // Ön sıra pahalı
          status: (row === 'A' && i === 3) ? 'SOLD' : 'AVAILABLE', // A3 koltuğunu "Satılmış" yapalım
          eventId: event.id,
        },
      });
    }
  }

  console.log(`✅ ${event.title} etkinliği ve koltukları oluşturuldu.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());