import { Body, Controller, Get, Param, Post, Put, Delete, Query, Inject, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from './prisma.service';

const VALID_CARD_NUMBER = '1234123412341234';

@Controller()
export class AppController {
  constructor(
    @Inject('TICKET_SERVICE') private readonly client: ClientProxy,
    private prisma: PrismaService,
  ) {}

  // 1. Etkinlikleri Getir (Filtreli)
  @Get('events')
  async getEvents(@Query('creatorEmail') creatorEmail?: string) {
    const whereCondition: any = { isActive: true };

    // Eğer parametre olarak email gelirse, sadece o kişinin oluşturduklarını filtrele
    if (creatorEmail) {
      whereCondition.creator = { email: creatorEmail };
    }

    return this.prisma.event.findMany({
      where: whereCondition,
      orderBy: { date: 'asc' },
      include: { 
        creator: { 
          select: { id: true, name: true, email: true } 
        } 
      }
    });
  }

  // 2. Etkinlik Detay
  @Get('events/:id')
  async getEventDetails(@Param('id') id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: Number(id) },
      include: { seats: { orderBy: { label: 'asc' } } },
    });
    if (!event) throw new BadRequestException('Etkinlik bulunamadı');
    return event;
  }

  // 3. Biletlerim
  @Get('my-tickets/:email')
  async getMyTickets(@Param('email') email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        tickets: {
          include: { seat: { include: { event: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    return user ? user.tickets : [];
  }

  // 4. Bilet Satın Al
  @Post('buy-ticket')
  async buyTicket(@Body() body: { seats: string[]; email: string; cardNumber: string; eventId: number }) {
    const event = await this.prisma.event.findUnique({ where: { id: body.eventId } });
    if (!event) throw new BadRequestException('Etkinlik bulunamadı.');
    
    if (new Date(event.date) < new Date()) {
        throw new BadRequestException('Bu etkinliğin tarihi geçmiş, bilet alınamaz.');
    }

    const user = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new BadRequestException('Giriş yapmalısınız.');

    if (body.cardNumber !== VALID_CARD_NUMBER) throw new BadRequestException('Kart geçersiz.');

    const availableSeats = await this.prisma.seat.count({
      where: { eventId: body.eventId, label: { in: body.seats }, status: 'AVAILABLE' }
    });

    if (availableSeats !== body.seats.length) throw new BadRequestException('Koltuklar dolu.');

    await this.prisma.$transaction(async (tx) => {
      await tx.seat.updateMany({
        where: { eventId: body.eventId, label: { in: body.seats } },
        data: { status: 'SOLD' }
      });

      for (const seatLabel of body.seats) {
        const seat = await tx.seat.findFirst({ where: { eventId: body.eventId, label: seatLabel }});
        await tx.ticket.create({
          data: { userId: user.id, seatId: seat!.id, pricePaid: seat!.price }
        });
      }
    });

    this.client.emit('ticket_created', { user: user.name, email: user.email, seats: body.seats, date: new Date() });
    
    return { message: 'İşlem Başarılı!' };
  }

  // 5. Etkinlik Oluştur (Sahibi Kaydet)
  @Post('create-event')
  async createEvent(@Body() body: { title: string; location: string; date: string; price: number; imageUrl: string; rowCount: number; colCount: number; email: string }) {
    const admin = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (!admin || admin.role !== 'ADMIN') throw new UnauthorizedException('Yetkisiz işlem.');

    const newEvent = await this.prisma.event.create({
      data: {
        title: body.title,
        location: body.location,
        date: new Date(body.date),
        price: Number(body.price),
        imageUrl: body.imageUrl || 'https://via.placeholder.com/800x400',
        description: `Kapasite: ${body.rowCount * body.colCount}`,
        creatorId: admin.id,
      },
    });

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const seatsData: any[] = [];
    
    for (let r = 0; r < body.rowCount; r++) {
      const rowLabel = alphabet[r] || `R${r+1}`; 
      let finalPrice = Number(body.price);
      if (r < Math.ceil(body.rowCount / 3)) finalPrice = finalPrice * 1.5;
      else if (r >= body.rowCount - Math.ceil(body.rowCount / 3)) finalPrice = finalPrice * 0.8;

      for (let c = 1; c <= body.colCount; c++) {
        seatsData.push({
          label: `${rowLabel}${c}`,
          price: Math.round(finalPrice),
          status: 'AVAILABLE' as any,
          eventId: newEvent.id,
        });
      }
    }
    await this.prisma.seat.createMany({ data: seatsData });
    return { message: 'Etkinlik oluşturuldu!', event: newEvent };
  }

  // 6. Etkinlik Düzenle (Sadece Sahibi)
  @Put('events/:id')
  async updateEvent(@Param('id') id: string, @Body() body: { title: string; location: string; date: string; price: number; imageUrl: string; email: string }) {
    const eventId = Number(id);
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new BadRequestException('Etkinlik bulunamadı.');

    const user = await this.prisma.user.findUnique({ where: { email: body.email } });
    
    if (!user || (event.creatorId && event.creatorId !== user.id)) {
        throw new UnauthorizedException('Bu etkinliği sadece oluşturan kişi düzenleyebilir!');
    }

    await this.prisma.event.update({
        where: { id: eventId },
        data: {
            title: body.title,
            location: body.location,
            date: new Date(body.date),
            price: Number(body.price),
            imageUrl: body.imageUrl
        }
    });

    return { message: 'Etkinlik güncellendi.' };
  }

  // 7. Etkinlik Sil (Sadece Sahibi)
  @Delete('events/:id')
  async deleteEvent(@Param('id') id: string, @Query('email') email: string) {
    const eventId = Number(id);
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new BadRequestException('Etkinlik bulunamadı.');

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || (event.creatorId && event.creatorId !== user.id)) {
        throw new UnauthorizedException('Bu etkinliği silme yetkiniz yok!');
    }
    
    await this.prisma.$transaction(async (tx) => {
      const seats = await tx.seat.findMany({ where: { eventId } });
      const seatIds = seats.map(s => s.id);
      
      await tx.ticket.deleteMany({ where: { seatId: { in: seatIds } } });
      await tx.seat.deleteMany({ where: { eventId } });
      await tx.event.delete({ where: { id: eventId } });
    });

    return { message: 'Etkinlik başarıyla silindi.' };
  }

  @EventPattern('ticket_created')
  handleTicketCreated(@Payload() data: any) { console.log('⚡ RabbitMQ:', data); }
}