import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors
} from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

// 用户注册
router.post('/register', validateUserRegistration, AuthController.register);

// 用户登录
router.post('/login', validateUserLogin, AuthController.login);

// 刷新 Token
router.post('/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    handleValidationErrors
  ],
  AuthController.refreshToken
);

// 获取用户信息 (需要认证)
router.get('/profile', authenticateToken, AuthController.getProfile);

// 更新用户信息 (需要认证)
router.put('/profile',
  authenticateToken,
  [
    body('displayName').optional().isLength({ min: 1, max: 50 }),
    body('bio').optional().isLength({ max: 500 }),
    body('avatar').optional().isURL(),
    handleValidationErrors
  ],
  AuthController.updateProfile
);

// 验证 Token (需要认证)
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: (req as any).user,
      valid: true
    }
  });
});

export default router;