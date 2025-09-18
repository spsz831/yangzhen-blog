import { Router } from 'express';
import { CategoryController } from '../controllers/category';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validatePagination } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

// 创建分类 (需要管理员权限)
router.post('/',
  authenticateToken,
  requireAdmin,
  [
    body('name').isLength({ min: 1, max: 50 }).trim(),
    body('description').optional().isLength({ max: 200 }),
    body('color').optional().isHexColor(),
  ],
  CategoryController.createCategory
);

// 获取分类列表 (公开接口)
router.get('/',
  validatePagination,
  CategoryController.getCategories
);

// 通过 slug 获取分类详情 (公开接口)
router.get('/:slug',
  [
    param('slug').isString().notEmpty()
  ],
  CategoryController.getCategoryBySlug
);

// 更新分类 (需要管理员权限)
router.put('/:id',
  authenticateToken,
  requireAdmin,
  [
    param('id').isString().notEmpty(),
    body('name').optional().isLength({ min: 1, max: 50 }).trim(),
    body('description').optional().isLength({ max: 200 }),
    body('color').optional().isHexColor(),
  ],
  CategoryController.updateCategory
);

// 删除分类 (需要管理员权限)
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  [
    param('id').isString().notEmpty()
  ],
  CategoryController.deleteCategory
);

export default router;