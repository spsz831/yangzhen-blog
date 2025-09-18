import { Router } from 'express';
import { UserController } from '../controllers/user';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validatePagination } from '../middleware/validation';
import { param } from 'express-validator';

const router = Router();

// 获取用户列表 (需要管理员权限)
router.get('/',
  authenticateToken,
  requireAdmin,
  validatePagination,
  UserController.getUsers
);

// 通过用户名获取用户信息 (公开接口)
router.get('/username/:username',
  [
    param('username').isAlphanumeric().isLength({ min: 3, max: 30 })
  ],
  UserController.getUserByUsername
);

// 通过 ID 获取用户信息 (需要认证)
router.get('/:id',
  authenticateToken,
  [
    param('id').isString().notEmpty()
  ],
  UserController.getUserById
);

// 切换用户状态 (需要管理员权限)
router.patch('/:id/toggle-status',
  authenticateToken,
  requireAdmin,
  [
    param('id').isString().notEmpty()
  ],
  UserController.toggleUserStatus
);

export default router;