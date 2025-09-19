# 用户认证系统 API 文档

## 概览

用户认证系统提供完整的用户注册、登录、权限管理功能，使用 JWT 进行身份验证。

## API 端点

### 1. 用户注册
```
POST /api/auth/register
```

**请求体:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "displayName": "用户显示名",
  "password": "password123",
  "bio": "用户简介 (可选)"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "displayName": "用户显示名",
      "avatar": null,
      "bio": "用户简介",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "User registered successfully"
}
```

### 2. 用户登录
```
POST /api/auth/login
```

**请求体:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. 刷新 Token
```
POST /api/auth/refresh
```

**请求体:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### 4. 获取用户信息
```
GET /api/auth/profile
Authorization: Bearer <access_token>
```

### 5. 更新用户信息
```
PUT /api/auth/profile
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "displayName": "新的显示名",
  "bio": "新的简介",
  "avatar": "头像URL"
}
```

### 6. 验证 Token
```
GET /api/auth/verify
Authorization: Bearer <access_token>
```

## 用户管理 API

### 1. 获取用户列表 (管理员)
```
GET /api/users?page=1&limit=10&search=keyword
Authorization: Bearer <admin_token>
```

### 2. 通过用户名获取用户 (公开)
```
GET /api/users/username/:username
```

### 3. 通过 ID 获取用户
```
GET /api/users/:id
Authorization: Bearer <access_token>
```

### 4. 切换用户状态 (管理员)
```
PATCH /api/users/:id/toggle-status
Authorization: Bearer <admin_token>
```

## 错误处理

**常见错误响应:**
```json
{
  "success": false,
  "error": "错误信息",
  "details": "详细信息 (可选)"
}
```

**HTTP 状态码:**
- 200: 成功
- 201: 创建成功
- 400: 请求错误
- 401: 未授权
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器错误

## 认证流程

1. **注册/登录** → 获取 access_token 和 refresh_token
2. **API 调用** → 在 Header 中携带 `Authorization: Bearer <access_token>`
3. **Token 过期** → 使用 refresh_token 获取新的 access_token
4. **权限控制** → 某些 API 需要管理员权限

## 安全特性

- 密码使用 bcrypt 加密存储
- JWT Token 有效期为 7 天
- Refresh Token 有效期为 30 天
- 支持 Token 刷新机制
- 管理员权限控制
- 用户状态管理 (激活/禁用)