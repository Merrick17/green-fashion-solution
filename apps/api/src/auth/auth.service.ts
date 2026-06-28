import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { emailTemplates } from '../email/email-templates';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '@repo/types';
import { AUTH_TTL } from './auth-constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
    private readonly emailService: EmailService,
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

    try {
      const crypto = await import('node:crypto');
      const verifyToken = crypto.randomBytes(16).toString('hex');
      const redisClient = this.redis.getClient();
      if (redisClient) {
        await redisClient.set('email-verify:' + verifyToken, user.id, 'EX', 86400);
      }
      const nestBase = process.env.API_URL || 'http://localhost:3000';
      const verifyUrl = nestBase + '/auth/verify-email?token=' + verifyToken;
      await this.emailService.send(
        user.email,
        'Verify your GFS email',
        emailTemplates.emailVerificationEmail(user.name, verifyUrl),
      );
    } catch (err) {
      this.logger.warn('Could not send verification email: ' + (err as Error)?.message);
    }

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

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; // silent — no user enumeration
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    const redisClient = this.redis.getClient();
    if (redisClient) {
      await redisClient.set('pwd-reset:' + token, user.id, 'EX', 900);
    }
    const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:3001';
    const resetUrl = webOrigin + '/reset-password?token=' + token;
    await this.emailService.send(
      user.email,
      'Reset your GFS password',
      emailTemplates.passwordResetEmail(user.name, resetUrl),
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const redisClient = this.redis.getClient();
    const userId = redisClient ? await redisClient.get('pwd-reset:' + token) : null;
    if (!userId) throw new BadRequestException('Reset link has expired or is invalid');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    if (redisClient) {
      await redisClient.del('pwd-reset:' + token);
    }
    await this.redis.revokeAllRefreshTokens(userId);
  }

  async verifyEmail(token: string): Promise<string> {
    const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:3001';
    const redisClient = this.redis.getClient();
    const userId = redisClient ? await redisClient.get('email-verify:' + token) : null;
    if (!userId) return webOrigin + '/login?verified=error';
    try {
      await this.prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });
      if (redisClient) {
        await redisClient.del('email-verify:' + token);
      }
    } catch {
      return webOrigin + '/login?verified=error';
    }
    return webOrigin + '/login?verified=1';
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
