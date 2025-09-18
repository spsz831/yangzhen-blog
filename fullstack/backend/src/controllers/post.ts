import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse, CreatePostRequest, UpdatePostRequest, PaginationParams, PaginatedResponse } from '../types/api';
import { generateSlug, extractExcerpt, validateSlug, sanitizeContent } from '../utils/content';

export class PostController {
  static async createPost(req: Request, res: Response) {
    try {
      const authorId = (req as any).user.id;
      const { title, content, excerpt, coverImage, categoryId, tags, published = false }: CreatePostRequest = req.body;

      // 生成 slug
      let slug = generateSlug(title);

      // 确保 slug 唯一
      let slugCounter = 1;
      let originalSlug = slug;
      while (await prisma.post.findUnique({ where: { slug } })) {
        slug = `${originalSlug}-${slugCounter}`;
        slugCounter++;
      }

      // 清理和处理内容
      const sanitizedContent = sanitizeContent(content);
      const finalExcerpt = excerpt || extractExcerpt(sanitizedContent);

      // 创建文章
      const post = await prisma.post.create({
        data: {
          title,
          slug,
          content: sanitizedContent,
          excerpt: finalExcerpt,
          coverImage: coverImage || null,
          published,
          authorId,
          categoryId: categoryId || null,
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
          category: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          }
        }
      });

      // 处理标签
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          const tagSlug = generateSlug(tagName);

          // 创建或获取标签
          const tag = await prisma.tag.upsert({
            where: { slug: tagSlug },
            update: {},
            create: {
              name: tagName,
              slug: tagSlug,
            }
          });

          // 关联标签
          await prisma.postTag.create({
            data: {
              postId: post.id,
              tagId: tag.id,
            }
          });
        }
      }

      // 重新获取完整的文章数据
      const fullPost = await prisma.post.findUnique({
        where: { id: post.id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            }
          },
          category: true,
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          }
        }
      });

      const response: ApiResponse = {
        success: true,
        data: fullPost,
        message: 'Post created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create post error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async getPosts(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        category,
        tag,
        published,
        featured,
        author
      } = req.query as PaginationParams & {
        search?: string;
        category?: string;
        tag?: string;
        published?: string;
        featured?: string;
        author?: string;
      };

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // 构建查询条件
      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (category) {
        where.category = { slug: category };
      }

      if (tag) {
        where.tags = {
          some: {
            tag: { slug: tag }
          }
        };
      }

      if (published !== undefined) {
        where.published = published === 'true';
      }

      if (featured !== undefined) {
        where.featured = featured === 'true';
      }

      if (author) {
        where.author = { username: author };
      }

      // 获取文章列表
      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              }
            },
            category: true,
            tags: {
              include: {
                tag: true
              }
            },
            _count: {
              select: {
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
        prisma.post.count({ where })
      ]);

      const totalPages = Math.ceil(total / take);

      const response: ApiResponse<PaginatedResponse<typeof posts[0]>> = {
        success: true,
        data: {
          data: posts,
          total,
          page: Number(page),
          limit: take,
          totalPages
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get posts error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async getPostBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const post = await prisma.post.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              bio: true,
            }
          },
          category: true,
          tags: {
            include: {
              tag: true
            }
          },
          comments: {
            where: { parentId: null },
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
                }
              },
              _count: {
                select: { likes: true }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          }
        }
      });

      if (!post) {
        const response: ApiResponse = {
          success: false,
          error: 'Post not found'
        };
        return res.status(404).json(response);
      }

      // 如果文章未发布，只有作者和管理员可以查看
      if (!post.published) {
        const user = (req as any).user;
        if (!user || (user.id !== post.authorId && user.role !== 'ADMIN')) {
          const response: ApiResponse = {
            success: false,
            error: 'Post not found'
          };
          return res.status(404).json(response);
        }
      }

      // 增加浏览量 (如果是已发布的文章)
      if (post.published) {
        await prisma.post.update({
          where: { id: post.id },
          data: { views: { increment: 1 } }
        });
        post.views += 1;
      }

      const response: ApiResponse = {
        success: true,
        data: post
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get post by slug error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async updatePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const { title, content, excerpt, coverImage, categoryId, tags, published }: UpdatePostRequest = req.body;

      // 检查文章是否存在
      const existingPost = await prisma.post.findUnique({
        where: { id },
        include: {
          tags: {
            include: { tag: true }
          }
        }
      });

      if (!existingPost) {
        const response: ApiResponse = {
          success: false,
          error: 'Post not found'
        };
        return res.status(404).json(response);
      }

      // 权限检查：只有作者和管理员可以编辑
      if (existingPost.authorId !== userId && userRole !== 'ADMIN') {
        const response: ApiResponse = {
          success: false,
          error: 'Permission denied'
        };
        return res.status(403).json(response);
      }

      // 准备更新数据
      const updateData: any = {};

      if (title !== undefined) {
        updateData.title = title;
        // 如果标题改变，更新 slug
        if (title !== existingPost.title) {
          let newSlug = generateSlug(title);

          // 确保 slug 唯一 (排除当前文章)
          let slugCounter = 1;
          let originalSlug = newSlug;
          while (await prisma.post.findFirst({
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

      if (content !== undefined) {
        updateData.content = sanitizeContent(content);
        // 如果没有提供摘要，从内容中提取
        if (excerpt === undefined) {
          updateData.excerpt = extractExcerpt(updateData.content);
        }
      }

      if (excerpt !== undefined) {
        updateData.excerpt = excerpt;
      }

      if (coverImage !== undefined) {
        updateData.coverImage = coverImage || null;
      }

      if (categoryId !== undefined) {
        updateData.categoryId = categoryId || null;
      }

      if (published !== undefined) {
        updateData.published = published;
      }

      // 更新文章
      const updatedPost = await prisma.post.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            }
          },
          category: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          }
        }
      });

      // 处理标签更新
      if (tags !== undefined) {
        // 删除现有的标签关联
        await prisma.postTag.deleteMany({
          where: { postId: id }
        });

        // 添加新的标签关联
        if (tags.length > 0) {
          for (const tagName of tags) {
            const tagSlug = generateSlug(tagName);

            // 创建或获取标签
            const tag = await prisma.tag.upsert({
              where: { slug: tagSlug },
              update: {},
              create: {
                name: tagName,
                slug: tagSlug,
              }
            });

            // 关联标签
            await prisma.postTag.create({
              data: {
                postId: id,
                tagId: tag.id,
              }
            });
          }
        }
      }

      // 重新获取完整的文章数据
      const fullPost = await prisma.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            }
          },
          category: true,
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          }
        }
      });

      const response: ApiResponse = {
        success: true,
        data: fullPost,
        message: 'Post updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Update post error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      // 检查文章是否存在
      const post = await prisma.post.findUnique({
        where: { id },
        select: { id: true, authorId: true, title: true }
      });

      if (!post) {
        const response: ApiResponse = {
          success: false,
          error: 'Post not found'
        };
        return res.status(404).json(response);
      }

      // 权限检查：只有作者和管理员可以删除
      if (post.authorId !== userId && userRole !== 'ADMIN') {
        const response: ApiResponse = {
          success: false,
          error: 'Permission denied'
        };
        return res.status(403).json(response);
      }

      // 删除文章 (级联删除相关数据)
      await prisma.post.delete({
        where: { id }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Post deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Delete post error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }

  static async toggleLike(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      // 检查文章是否存在
      const post = await prisma.post.findUnique({
        where: { id },
        select: { id: true, published: true }
      });

      if (!post || !post.published) {
        const response: ApiResponse = {
          success: false,
          error: 'Post not found'
        };
        return res.status(404).json(response);
      }

      // 检查是否已经点赞
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId: id
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
            type: 'POST',
            userId,
            postId: id
          }
        });

        const response: ApiResponse = {
          success: true,
          data: { liked: true },
          message: 'Post liked'
        };
        return res.status(200).json(response);
      }
    } catch (error) {
      console.error('Toggle like error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error'
      };
      res.status(500).json(response);
    }
  }
}