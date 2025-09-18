import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param, query } from 'express-validator';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// 用户验证规则
export const validateUserRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 30 }).isAlphanumeric(),
  body('displayName').isLength({ min: 1, max: 50 }),
  body('password').isLength({ min: 6 }),
  body('bio').optional().isLength({ max: 500 }),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors
];

// 文章验证规则
export const validatePostCreation = [
  body('title').isLength({ min: 1, max: 200 }),
  body('content').isLength({ min: 1 }),
  body('excerpt').optional().isLength({ max: 500 }),
  body('categoryId').optional().isString(),
  body('tags').optional().isArray(),
  body('published').optional().isBoolean(),
  handleValidationErrors
];

// 评论验证规则
export const validateCommentCreation = [
  body('content').isLength({ min: 1, max: 1000 }),
  body('postId').isString(),
  body('parentId').optional().isString(),
  handleValidationErrors
];

// 分页验证规则
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isString(),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  handleValidationErrors
];