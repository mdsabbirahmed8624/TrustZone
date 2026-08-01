import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    customer: {
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
      if (key === 'JWT_SECRET_KEY') return 'secret';
      if (key === 'JWT_REFRESH_SECRET_KEY') return 'refresh_secret';
      if (key === 'JWT_EXPIRES_IN') return '15m';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user and customer when email is unique', async () => {
      const registerDto = {
        email: 'test@email.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '+15550199',
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      (argon2.hash as jest.Mock).mockResolvedValueOnce('hashed_password');
      mockPrismaService.user.create.mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@email.com',
      });

      const result = await service.register(registerDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@email.com' },
      });
      expect(argon2.hash).toHaveBeenCalledWith('Password123!');
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.customer.create).toHaveBeenCalled();
      expect(result).toHaveProperty('userId', 'user-id');
      expect(result).toHaveProperty('verificationToken');
    });

    it('should throw ConflictException when email is already taken', async () => {
      const registerDto = {
        email: 'taken@email.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '+15550199',
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'existing',
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        'Email address is already registered.',
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'user@email.com',
      password: 'Password123!',
    };

    it('should return token pair on valid login', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'user@email.com',
        password: 'hashed_password',
        role: 'customer',
        failedLoginAttempts: 0,
        lockoutUntil: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true);
      mockPrismaService.user.update.mockResolvedValueOnce(mockUser);

      const result = await service.login(loginDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@email.com' },
      });
      expect(argon2.verify).toHaveBeenCalledWith(
        'hashed_password',
        'Password123!',
      );
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { failedLoginAttempts: 0, lockoutUntil: null },
      });
      expect(prisma.session.create).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should increment attempts and lock account on 5th failed login', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'user@email.com',
        password: 'hashed_password',
        role: 'customer',
        failedLoginAttempts: 4,
        lockoutUntil: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials.',
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: expect.objectContaining({
          failedLoginAttempts: 5,
          lockoutUntil: expect.any(Date),
        }),
      });
    });
  });
});
