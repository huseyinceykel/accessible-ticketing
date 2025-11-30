import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service'; // <-- BU SATIR ÖNEMLİ
import { AuthModule } from './auth/auth.module';   // <-- Auth modülü de burada olmalı

@Module({
  imports: [
    // 1. Auth Modülü
    AuthModule,
    
    // 2. RabbitMQ Modülü
    ClientsModule.register([
      {
        name: 'TICKET_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@rabbitmq:5672'],
          queue: 'tickets_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [AppController],
  // BURASI KRİTİK: PrismaService burada yazmalı
  providers: [AppService, PrismaService], 
})
export class AppModule {}