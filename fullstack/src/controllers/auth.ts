import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthService } from '../utils/auth';
import { ApiResponse, CreateUserRequest, LoginRequest } from '../types/api';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, username, displayName, password, bio }: CreateUserRequest = req.body;

      // 检查用户是否已存在
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          error: existingUser.email === email ? 'Email already exists' : 'Username already exists'
        };
        return res.status(400).json(response);
      }

      // 加密密码
      const hashedPassword = await AuthService.hashPassword(password);

      // 创建用户
      const user = await prisma.user.create({
        data: {
          email,
          username,
          displayName,
          password: hashedPassword,
          bio: bio || null,
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          role: true,
          createdAt: true,
        }
      });

      // 生成 token
      const token = AuthService.generateToken(user.id);
      const refreshToken = AuthService.generateRefreshToken(user.id);

      const response: ApiResponse = {
        success: true,
        data: {
          user,
          token,
          refreshToken
        },
        message: 'User registered successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginRequest = req.body;

      // 查找用户
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          password: true,
          avatar: true,
          bio: true,
          role: true,
          isActive: true,
          createdAt: true,
        }
      });

      if (!user || !user.isActive) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid credentials'
        };
        return res.status(401).json(response);
      }

      // 验证密码
      const isPasswordValid = await AuthService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid credentials'
        };
        return res.status(401).json(response);
      }

      // 生成 token
      const token = AuthService.generateToken(user.id);
      const refreshToken = AuthService.generateRefreshToken(user.id);

      // 移除密码字段
      const { password: _, ...userWithoutPassword } = user;

      const response: ApiResponse = {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
          refreshToken
        },
        message: 'Login successful'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          error: 'Refresh token required'
        };
        return res.status(400).json(response);
      }

      const { userId } = AuthService.verifyToken(refreshToken);

      // 验证用户是否存在且活跃
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true }
      });

      if (!user || !user.isActive) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid refresh token'
        };
        return res.status(401).json(response);
      }

      // 生成新的 token
      const newToken = AuthService.generateToken(userId);
      const newRefreshToken = AuthService.generateRefreshToken(userId);

      const response: ApiResponse = {
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Refresh token error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Invalid refresh token'
      };
      res.status(401).json(response);
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              likes: true,
            }
          }
        }
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: user
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get profile error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { displayName, bio, avatar } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(displayName && { displayName }),
          ...(bio !== undefined && { bio }),
          ...(avatar !== undefined && { avatar }),
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          role: true,
          updatedAt: true,
        }
      });

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Profile updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update profile error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }
}