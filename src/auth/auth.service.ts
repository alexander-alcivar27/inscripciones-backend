
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
 
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
 
  // ─── LOGIN ───────────────────────────────────
  async login(usuario: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { usuario } });
 
    if (!admin) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
 
    const passwordValido = await bcrypt.compare(password, admin.password);
    if (!passwordValido) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
 
    const payload = { sub: admin.id, usuario: admin.usuario };
    const token = this.jwtService.sign(payload);
 
    return {
      token,
      admin: {
        id:      admin.id,
        usuario: admin.usuario,
        nombre:  admin.nombre,
      },
    };
  }
 
  // ─── CREAR ADMIN (solo usar 1 vez para el primer admin) ──
  async crearAdmin(usuario: string, password: string, nombre?: string) {
    const existe = await this.prisma.admin.findUnique({ where: { usuario } });
    if (existe) throw new ConflictException('El usuario ya existe');
 
    const hash = await bcrypt.hash(password, 10);
    const admin = await this.prisma.admin.create({
      data: { usuario, password: hash, nombre },
    });
 
    return { message: 'Admin creado correctamente', id: admin.id, usuario: admin.usuario };
  }
 
  // ─── VERIFICAR TOKEN ─────────────────────────
  async verificarToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
      if (!admin) throw new Error();
      return { valido: true, usuario: admin.usuario, nombre: admin.nombre };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
