import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. GİRİŞ YAP (LOGIN)
  async login(email: string, pass: string) {
    // Kullanıcıyı bul
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // Şifreyi kontrol et (Hash kıyaslama)
    // Not: Seed verisinde şifreler düz metindi ("123456password"), 
    // gerçek senaryoda bcrypt.compare kullanılır. 
    // Şimdilik demo için düz metin kontrolü yapıyoruz, aşağıya doğrusunu yorum olarak ekliyorum.
    
    // const isMatch = await bcrypt.compare(pass, user.password);
    const isMatch = pass === user.password; // Şimdilik basit kontrol (Seed uyumu için)

    if (!isMatch) {
      throw new UnauthorizedException('Şifre hatalı');
    }

    // Token oluştur
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { name: user.name, email: user.email, role: user.role }
    };
  }

  // 2. KAYIT OL (REGISTER)
  async register(body: any) {
    // Email kullanılıyor mu?
    const existingUser = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) throw new ConflictException('Bu email zaten kayıtlı.');

    // Şifreyi şifrele (Hash) - Yeni kullanıcılar için güvenli
    // const hashedPassword = await bcrypt.hash(body.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        password: body.password, // hashedPassword olmalı normalde
        name: body.name,
      },
    });

    return { message: 'Kayıt başarılı, giriş yapabilirsiniz.' };
  }
}