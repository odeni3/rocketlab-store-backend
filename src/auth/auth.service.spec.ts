import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      name: 'João Silva',
      email: 'joao@email.com',
      password: 'senha123',
      role: 'USER',
    };

    it('deve registrar um novo usuário com sucesso', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      const mockUser = {
        id: 'user-1',
        name: 'João Silva',
        email: 'joao@email.com',
        password: hashedPassword,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = 'mock-jwt-token';

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          password: hashedPassword,
          role: registerDto.role,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
    });

    it('deve lançar BadRequestException se email já existir', async () => {
      // Arrange
      const existingUser = { id: 'existing-user', email: registerDto.email };
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        new BadRequestException('Email já está em uso'),
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'joao@email.com',
      password: 'senha123',
    };

    it('deve fazer login com sucesso', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      const mockUser = {
        id: 'user-1',
        name: 'João Silva',
        email: 'joao@email.com',
        password: hashedPassword,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockToken = 'mock-jwt-token';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
    });

    it('deve lançar UnauthorizedException se usuário não existir', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciais inválidas'),
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException se senha for inválida', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'joao@email.com',
        password: 'hashedPassword123',
        role: 'USER',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciais inválidas'),
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('deve retornar usuário sem senha quando encontrado', async () => {
      // Arrange
      const userId = 'user-1';
      const mockUser = {
        id: userId,
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'hashedPassword123',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser(userId);

      // Assert
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('deve retornar null se usuário não for encontrado', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAllUsers', () => {
    it('deve retornar todos os usuários sem senhas', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 'user-1',
          name: 'João Silva',
          email: 'joao@email.com',
          password: 'hashedPassword123',
          role: 'USER',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: 'user-2',
          name: 'Admin User',
          email: 'admin@email.com',
          password: 'hashedPassword456',
          role: 'ADMIN',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
        },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await service.findAllUsers();

      // Assert
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
      expect(result[0]).toEqual({
        id: 'user-1',
        name: 'João Silva',
        email: 'joao@email.com',
        role: 'USER',
        createdAt: mockUsers[0].createdAt,
        updatedAt: mockUsers[0].updatedAt,
      });
    });

    it('deve retornar array vazio se não houver usuários', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAllUsers();

      // Assert
      expect(result).toEqual([]);
    });
  });
});
