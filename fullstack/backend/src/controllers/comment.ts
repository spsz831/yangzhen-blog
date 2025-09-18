import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse, CreateCommentRequest, PaginationParams, PaginatedResponse } from '../types/api';

export class CommentController {
  static async createComment(req: Request, res: Response) {
    try {
      const authorId = (req as any).user.id;
      const { content, postId, parentId }: CreateCommentRequest = req.body;

      // 检查文章是否存在且已发布
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true, published: true }
      });

      if (!post || !post.published) {
        const response: ApiResponse = {
          success: false,
          error: 'Post not found or not published'
        };
        return res.status(404).json(response);
      }

      // 如果是回复，检查父评论是否存在
      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
          select: { id: true, postId: true }
        });

        if (!parentComment || parentComment.postId !== postId) {
          const response: ApiResponse = {
            success: false,
            error: 'Parent comment not found or not belongs to this post'
          };
          return res.status(404).json(response);
        }
      }

      // 创建评论
      const comment = await prisma.comment.create({
        data: {
          content,
          authorId,
          postId,
          parentId: parentId || null,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            }
          },
          replies: {
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
                select: { likes: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: { likes: true }
          }
        }
      });

      const response: ApiResponse = {
        success: true,
        data: comment,
        message: 'Comment created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create comment error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async getCommentsByPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query as PaginationParams;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // 检查文章是否存在
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true, published: true }
      });

      if (!post || !post.published) {
        const response: ApiResponse = {
          success: false,
          error: 'Post not found or not published'
        };
        return res.status(404).json(response);
      }

      // 获取顶级评论和回复
      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: {
            postId,
            parentId: null
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              }
            },
            replies: {
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
                  select: { likes: true }
                }
              },
              orderBy: { createdAt: 'asc' }
            },
            _count: {
              select: { likes: true }
            }
          },
          skip,
          take,
          orderBy: {
            [sortBy]: sortOrder
          }
        }),
        prisma.comment.count({
          where: {
            postId,
            parentId: null
          }
        })
      ]);

      const totalPages = Math.ceil(total / take);

      const response: ApiResponse<PaginatedResponse<typeof comments[0]>> = {
        success: true,
        data: {
          data: comments,
          total,
          page: Number(page),
          limit: take,
          totalPages
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get comments error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async updateComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      // 检查评论是否存在
      const comment = await prisma.comment.findUnique({
        where: { id },
        select: { id: true, authorId: true, content: true }
      });

      if (!comment) {
        const response: ApiResponse = {
          success: false,
          error: 'Comment not found'
        };
        return res.status(404).json(response);
      }

      // 权限检查：只有作者和管理员可以编辑
      if (comment.authorId !== userId && userRole !== 'ADMIN') {
        const response: ApiResponse = {
          success: false,
          error: 'Permission denied'
        };
        return res.status(403).json(response);
      }

      // 更新评论
      const updatedComment = await prisma.comment.update({
        where: { id },
        data: { content },
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
            select: { likes: true }
          }
        }
      });

      const response: ApiResponse = {
        success: true,
        data: updatedComment,
        message: 'Comment updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update comment error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async deleteComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      // 检查评论是否存在
      const comment = await prisma.comment.findUnique({
        where: { id },
        select: { id: true, authorId: true }
      });

      if (!comment) {
        const response: ApiResponse = {
          success: false,
          error: 'Comment not found'
        };
        return res.status(404).json(response);
      }

      // 权限检查：只有作者和管理员可以删除
      if (comment.authorId !== userId && userRole !== 'ADMIN') {
        const response: ApiResponse = {
          success: false,
          error: 'Permission denied'
        };
        return res.status(403).json(response);
      }

      // 删除评论（级联删除回复）
      await prisma.comment.delete({
        where: { id }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Comment deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Delete comment error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async toggleCommentLike(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      // 检查评论是否存在
      const comment = await prisma.comment.findUnique({
        where: { id },
        select: { id: true }
      });

      if (!comment) {
        const response: ApiResponse = {
          success: false,
          error: 'Comment not found'
        };
        return res.status(404).json(response);
      }

      // 检查是否已经点赞
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId: id
          }
        }
      });

      if (existingLike) {
        // 取消点赞
        await prisma.like.delete({
          where: { id: existingLike.id }
        });

        const response: ApiResponse = {
          success: true,
          data: { liked: false },
          message: 'Like removed'
        };
        return res.status(200).json(response);
      } else {
        // 添加点赞
        await prisma.like.create({
          data: {
            type: 'COMMENT',
            userId,
            commentId: id
          }
        });

        const response: ApiResponse = {
          success: true,
          data: { liked: true },
          message: 'Comment liked'
        };
        return res.status(200).json(response);
      }
    } catch (error) {
      console.error('Toggle comment like error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }
}