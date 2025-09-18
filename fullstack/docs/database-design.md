# 数据库设计文档

## 数据库概览

YangZhen 个人博客网站使用 PostgreSQL 数据库和 Prisma ORM，设计了以下核心数据模型：

## 数据模型

### 1. User (用户表)
```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  username    String   @unique
  displayName String
  password    String
  avatar      String?
  bio         String?
  role        Role     @default(USER)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**字段说明：**
- `id`: 唯一标识符 (CUID)
- `email`: 邮箱地址 (唯一)
- `username`: 用户名 (唯一)
- `displayName`: 显示名称
- `password`: 加密密码
- `avatar`: 头像链接 (可选)
- `bio`: 个人简介 (可选)
- `role`: 用户角色 (USER/ADMIN)
- `isActive`: 是否激活

### 2. Post (文章表)
```prisma
model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String
  excerpt     String?
  coverImage  String?
  published   Boolean  @default(false)
  featured    Boolean  @default(false)
  views       Int      @default(0)
  authorId    String
  categoryId  String?
}
```

**字段说明：**
- `slug`: 文章唯一标识符 (用于URL)
- `content`: 文章内容 (Markdown格式)
- `excerpt`: 文章摘要
- `published`: 是否发布
- `featured`: 是否置顶
- `views`: 浏览次数

### 3. Category (分类表)
```prisma
model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  color       String?
}
```

### 4. Tag (标签表)
```prisma
model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  color     String?
}
```

### 5. Comment (评论表)
```prisma
model Comment {
  id        String   @id @default(cuid())
  content   String
  authorId  String
  postId    String
  parentId  String?  // 支持评论回复
}
```

**特性：**
- 支持嵌套评论 (通过 parentId)
- 级联删除相关数据
- 评论点赞功能

### 6. Like (点赞表)
```prisma
model Like {
  id        String    @id @default(cuid())
  type      LikeType  // POST/COMMENT
  userId    String
  postId    String?
  commentId String?
}
```

## 关系设计

### 一对多关系
- User → Posts (一个用户多篇文章)
- User → Comments (一个用户多条评论)
- Post → Comments (一篇文章多条评论)
- Category → Posts (一个分类多篇文章)

### 多对多关系
- Post ↔ Tag (通过 PostTag 关联表)

### 自引用关系
- Comment → Comment (评论回复)

## 索引策略

**自动索引：**
- 主键 `id` 字段
- 唯一约束字段 (`email`, `username`, `slug`)

**建议手动索引：**
- `posts.authorId` (查询用户文章)
- `posts.published` (查询已发布文章)
- `comments.postId` (查询文章评论)
- `posts.createdAt` (按时间排序)

## 安全特性

1. **数据完整性**
   - 外键约束确保数据一致性
   - 级联删除防止孤立数据

2. **性能优化**
   - CUID 作为主键提供更好性能
   - 合理的索引设计

3. **扩展性**
   - 预留可选字段 (avatar, bio, excerpt)
   - 灵活的标签系统

## 下一步

- [ ] 创建数据库迁移
- [ ] 生成 Prisma Client
- [ ] 创建种子数据
- [ ] 实现数据访问层