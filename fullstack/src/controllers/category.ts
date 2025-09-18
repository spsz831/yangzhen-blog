import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse, PaginationParams, PaginatedResponse } from '../types/api';
import { generateSlug } from '../utils/content';

export class CategoryController {
  static async createCategory(req: Request, res: Response) {
    try {
      const { name, description, color } = req.body;
      const userRole = (req as any).user.role;

      // 只有管理员可以创建分类
      if (userRole !== 'ADMIN') {
        const response: ApiResponse = {
          success: false,
          error: 'Admin access required'
        };
        return res.status(403).json(response);
      }

      // 生成 slug
      let slug = generateSlug(name);

      // 确保 slug 唯一
      let slugCounter = 1;
      let originalSlug = slug;
      while (await prisma.category.findUnique({ where: { slug } })) {
        slug = `${originalSlug}-${slugCounter}`;
        slugCounter++;
      }

      const category = await prisma.category.create({
        data: {
          name,
          slug,
          description: description || null,
          color: color || null,
        },
        include: {
          _count: {
            select: { posts: true }
          }
        }
      });

      const response: ApiResponse = {
        success: true,
        data: category,
        message: 'Category created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create category error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query as PaginationParams;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          include: {
            _count: {
              select: {
                posts: { where: { published: true } }
              }
            }
          },
          skip,
          take,
          orderBy: {
            [sortBy]: sortOrder
          }
        }),
        prisma.category.count()
      ]);

      const totalPages = Math.ceil(total / take);

      const response: ApiResponse<PaginatedResponse<typeof categories[0]>> = {
        success: true,
        data: {
          data: categories,
          total,
          page: Number(page),
          limit: take,
          totalPages
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get categories error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async getCategoryBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          posts: {
            where: { published: true },
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                }
              },
              _count: {
                select: {
                  comments: true,
                  likes: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          _count: {
            select: {
              posts: { where: { published: true } }
            }
          }
        }
      });

      if (!category) {
        const response: ApiResponse = {
          success: false,
          error: 'Category not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: category
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get category by slug error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, color } = req.body;
      const userRole = (req as any).user.role;

      // 只有管理员可以更新分类
      if (userRole !== 'ADMIN') {
        const response: ApiResponse = {
          success: false,
          error: 'Admin access required'
        };
        return res.status(403).json(response);
      }

      const existingCategory = await prisma.category.findUnique({
        where: { id }
      });

      if (!existingCategory) {
        const response: ApiResponse = {
          success: false,
          error: 'Category not found'
        };
        return res.status(404).json(response);
      }

      const updateData: any = {};

      if (name !== undefined) {
        updateData.name = name;
        // 如果名称改变，更新 slug
        if (name !== existingCategory.name) {
          let newSlug = generateSlug(name);

          // 确保 slug 唯一 (排除当前分类)
          let slugCounter = 1;
          let originalSlug = newSlug;
          while (await prisma.category.findFirst({
            where: {
              slug: newSlug,
              id: { not: id }
            }
          })) {
            newSlug = `${originalSlug}-${slugCounter}`;
            slugCounter++;
          }
          updateData.slug = newSlug;
        }
      }

      if (description !== undefined) {
        updateData.description = description || null;
      }

      if (color !== undefined) {
        updateData.color = color || null;
      }

      const category = await prisma.category.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: { posts: true }
          }
        }
      });

      const response: ApiResponse = {
        success: true,
        data: category,
        message: 'Category updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update category error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRole = (req as any).user.role;

      // 只有管理员可以删除分类
      if (userRole !== 'ADMIN') {
        const response: ApiResponse = {
          success: false,
          error: 'Admin access required'
        };
        return res.status(403).json(response);
      }

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: { posts: true }
          }
        }
      });

      if (!category) {
        const response: ApiResponse = {
          success: false,
          error: 'Category not found'
        };
        return res.status(404).json(response);
      }

      // 检查是否有关联的文章
      if (category._count.posts > 0) {
        const response: ApiResponse = {
          success: false,
          error: 'Cannot delete category with associated posts'
        };
        return res.status(400).json(response);
      }

      await prisma.category.delete({
        where: { id }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Category deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Delete category error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }
}