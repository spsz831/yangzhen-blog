import { Router } from 'express';
import { CommentController } from '../controllers/comment';
import { authenticateToken } from '../middleware/auth';
import { validateCommentCreation, validatePagination } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

// 创建评论 (需要认证)
router.post('/',
  authenticateToken,
  validateCommentCreation,
  CommentController.createComment
);

// 获取文章的评论列表 (公开接口)
router.get('/post/:postId',
  [
    param('postId').isString().notEmpty(),
    ...validatePagination
  ],
  CommentController.getCommentsByPost
);

// 更新评论 (需要认证，只有作者和管理员)
router.put('/:id',
  authenticateToken,
  [
    param('id').isString().notEmpty(),
    body('content').isLength({ min: 1, max: 1000 }).trim()
  ],
  CommentController.updateComment
);

// 删除评论 (需要认证，只有作者和管理员)
router.delete('/:id',
  authenticateToken,
  [
    param('id').isString().notEmpty()
  ],
  CommentController.deleteComment
);

// 点赞/取消点赞评论 (需要认证)
router.post('/:id/like',
  authenticateToken,
  [
    param('id').isString().notEmpty()
  ],
  CommentController.toggleCommentLike
);

export default router;