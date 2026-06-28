import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';

const mockUser = {
  id: 'user-1',
  email: 'admin@gfs.com',
  password: 'hashed-password',
  name: 'Green Admin',
  role: 'ADMIN',
  blocked: false,
  emailNotifications: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: jest.Mocked<Pick<PrismaService, 'user'>>;
  let mockRedis: jest.Mocked<Pick<RedisService, 'isRefreshTokenValid' | 'storeRefreshToken' | 'revokeRefreshToken' | 'revokeAllRefreshTokens'>>;
  let mockJwt: jest.Mocked<Pick<JwtService, 'sign' | 'verify'>>;

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      } as any,
    };

    mockRedis = {
      isRefreshTokenValid: jest.fn(),
      storeRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllRefreshTokens: jest.fn(),
    };

    mockJwt = {
      sign: jest.fn().mockReturnValue('signed-token'),
      verify: jest.fn(),
    };

    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockRedis.storeRefreshToken as jest.Mock).mockResolvedValue(undefined);

      const result = await service.login({ email: 'admin@gfs.com', password: 'admin123' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('role');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'admin@gfs.com' } });
    });

    it('throws UnauthorizedException for unknown email', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login({ email: 'nobody@example.com', password: 'pass' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'admin@gfs.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException for blocked account', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, blocked: true });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login({ email: 'admin@gfs.com', password: 'admin123' }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('refresh', () => {
    it('returns new access token for valid refresh token', async () => {
      const payload = { sub: 'user-1', email: 'admin@gfs.com', role: 'ADMIN' };
      (mockJwt.verify as jest.Mock).mockReturnValue(payload);
      (mockRedis.isRefreshTokenValid as jest.Mock).mockResolvedValue(true);
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockRedis.revokeRefreshToken as jest.Mock).mockResolvedValue(undefined);
      (mockRedis.storeRefreshToken as jest.Mock).mockResolvedValue(undefined);

      const result = await service.refresh('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockRedis.revokeRefreshToken).toHaveBeenCalledWith('user-1', 'valid-refresh-token');
    });

    it('throws UnauthorizedException when refresh token is revoked', async () => {
      const payload = { sub: 'user-1', email: 'admin@gfs.com', role: 'ADMIN' };
      (mockJwt.verify as jest.Mock).mockReturnValue(payload);
      (mockRedis.isRefreshTokenValid as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh('revoked-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when no refresh token provided', async () => {
      await expect(service.refresh('')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for invalid token signature', async () => {
      (mockJwt.verify as jest.Mock).mockImplementation(() => { throw new Error('invalid signature'); });

      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('removes specific refresh token from Redis', async () => {
      (mockRedis.revokeRefreshToken as jest.Mock).mockResolvedValue(undefined);

      await service.logout('user-1', 'some-refresh-token');

      expect(mockRedis.revokeRefreshToken).toHaveBeenCalledWith('user-1', 'some-refresh-token');
      expect(mockRedis.revokeAllRefreshTokens).not.toHaveBeenCalled();
    });

    it('revokes all refresh tokens when none specified', async () => {
      (mockRedis.revokeAllRefreshTokens as jest.Mock).mockResolvedValue(undefined);

      await service.logout('user-1');

      expect(mockRedis.revokeAllRefreshTokens).toHaveBeenCalledWith('user-1');
    });
  });
});
