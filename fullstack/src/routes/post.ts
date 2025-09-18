import { Router } from 'express';
import { PostController } from '../controllers/post';
import { authenticateToken } from '../middleware/auth';
import { validatePostCreation, validatePagination } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// 创建文章 (需要认证)
router.post('/',
  authenticateToken,
  validatePostCreation,
  PostController.createPost
);

// 获取文章列表 (公开接口，支持筛选和分页)
router.get('/',
  validatePagination,
  PostController.getPosts
);

// 通过 slug 获取单篇文章 (公开接口，但未发布文章需要权限)
router.get('/:slug',
  [
    param('slug').isString().notEmpty()
  ],
  PostController.getPostBySlug
);

// 更新文章 (需要认证，只有作者和管理员)
router.put('/:id',
  authenticateToken,
  [
    param('id').isString().notEmpty(),
    body('title').optional().isLength({ min: 1, max: 200 }),
    body('content').optional().isLength({ min: 1 }),
    body('excerpt').optional().isLength({ max: 500 }),
    body('categoryId').optional().isString(),
    body('tags').optional().isArray(),
    body('published').optional().isBoolean(),
  ],
  PostController.updatePost
);

// 删除文章 (需要认证，只有作者和管理员)
router.delete('/:id',
  authenticateToken,
  [
    param('id').isString().notEmpty()
  ],
  PostController.deletePost
);

// 点赞/取消点赞文章 (需要认证)
router.post('/:id/like',
  authenticateToken,
  [
    param('id').isString().notEmpty()
  ],
  PostController.toggleLike
);

export default router;