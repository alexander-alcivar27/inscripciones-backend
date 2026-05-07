// src/auth/auth.controller.ts
import {
  Controller, Post, Body, Get,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
 
@Controller('auth')
export class AuthController {
 
  constructor(private authService: AuthService) {}
 
  // POST /auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { usuario: string; password: string }) {
    return this.authService.login(body.usuario, body.password);
  }
 
  // POST /auth/crear-admin
  // ⚠️  Úsalo UNA sola vez para crear tu primer admin,
  //     luego puedes protegerlo con el guard si quieres.
  @Post('crear-admin')
  @HttpCode(HttpStatus.CREATED)
  async crearAdmin(
    @Body() body: { usuario: string; password: string; nombre?: string },
  ) {
    return this.authService.crearAdmin(body.usuario, body.password, body.nombre);
  }
 
  // GET /auth/me  →  verifica que el token sea válido
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    return {
      valido: true,
      usuario: req.user.usuario,
      nombre:  req.user.nombre,
    };
  }
}
