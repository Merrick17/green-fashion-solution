import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '@repo/types';
import { AUTH_TTL } from './auth-constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.blocked) {
      throw new ForbiddenException('Your account has been blocked. Contact support.');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new UnauthorizedException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        role: UserRole.CUSTOMER,
      },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('No refresh token provided');

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) throw new UnauthorizedException('Server misconfigured');

    try {
      const payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });

      const valid = await this.redis.isRefreshTokenValid(payload.sub, refreshToken);
      if (!valid) throw new UnauthorizedException('Refresh token revoked');

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');
      if (user.blocked) throw new ForbiddenException('Your account has been blocked');

      await this.redis.revokeRefreshToken(user.id, refreshToken);
      return this.generateTokens(user.id, user.email, user.role);
    } catch (err) {
      if (err instanceof UnauthorizedException || err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.redis.revokeRefreshToken(userId, refreshToken);
    } else {
      await this.redis.revokeAllRefreshTokens(userId);
    }
  }

  async logoutFromRefreshToken(refreshToken: string) {
    if (!refreshToken) return;

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) return;

    try {
      const payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
      await this.redis.revokeRefreshToken(payload.sub, refreshToken);
    } catch {
      /* token already invalid */
    }
  }

  private async generateTokens(sub: string, email: string, role: string) {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !refreshSecret) throw new UnauthorizedException('Server misconfigured');

    const accessToken = this.jwtService.sign({ sub, email, role }, { secret: jwtSecret, expiresIn: AUTH_TTL.ACCESS_JWT });
    const refreshToken = this.jwtService.sign(
      { sub, email, role },
      { secret: refreshSecret, expiresIn: AUTH_TTL.REFRESH_JWT },
    );

    await this.redis.storeRefreshToken(sub, refreshToken, AUTH_TTL.REFRESH_SECONDS);
    return { accessToken, refreshToken, role };
  }
}
