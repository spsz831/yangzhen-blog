import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse, PaginationParams, PaginatedResponse } from '../types/api';

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search
      } = req.query as PaginationParams & { search?: string };

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // 构建搜索条件
      const where = search ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' as const } },
          { displayName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ]
      } : {};

      // 获取用户列表
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            role: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: {
                posts: true,
                comments: true,
                likes: true,
              }
            }
          },
          skip,
          take,
          orderBy: {
            [sortBy]: sortOrder
          }
        }),
        prisma.user.count({ where })
      ]);

      const totalPages = Math.ceil(total / take);

      const response: ApiResponse<PaginatedResponse<typeof users[0]>> = {
        success: true,
        data: {
          data: users,
          total,
          page: Number(page),
          limit: take,
          totalPages
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get users error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: { where: { published: true } },
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
      console.error('Get user by ID error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async getUserByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;

      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              posts: { where: { published: true } },
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

      // 获取用户最近的文章
      const recentPosts = await prisma.post.findMany({
        where: {
          authorId: user.id,
          published: true
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          createdAt: true,
          views: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      const response: ApiResponse = {
        success: true,
        data: {
          user,
          recentPosts
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get user by username error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async toggleUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // 只有管理员可以操作
      if (currentUser.role !== 'ADMIN') {
        const response: ApiResponse = {
          success: false,
          error: 'Admin access required'
        };
        return res.status(403).json(response);
      }

      // 不能操作自己的账户
      if (id === currentUser.id) {
        const response: ApiResponse = {
          success: false,
          error: 'Cannot modify own account status'
        };
        return res.status(400).json(response);
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, isActive: true, username: true }
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found'
        };
        return res.status(404).json(response);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive },
        select: {
          id: true,
          username: true,
          displayName: true,
          isActive: true,
          updatedAt: true
        }
      });

      const response: ApiResponse = {
        success: true,
        data: updatedUser,
        message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Toggle user status error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }
}