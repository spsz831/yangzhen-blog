'use client';

import { useEffect, useState } from 'react';
import { notFound } = 'next/navigation';
import { Post } from '@/types';
import { postApi } from '@/lib/blog-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentSection } from '@/components/comments/CommentSection';
import { Calendar, Eye, Heart, MessageCircle, User, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await postApi.getPostBySlug(params.slug);

        if (response.success && response.data) {
          setPost(response.data);
          setLikeCount(response.data._count.likes);
        } else {
          notFound();
        }
      } catch (error) {
        console.error('获取文章失败:', error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  const handleLike = async () => {
    if (!post) return;

    try {
      const response = await postApi.toggleLike(post.id);
      if (response.success && response.data) {
        setIsLiked(response.data.liked);
        setLikeCount(prev => response.data.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!post) {
    return notFound();
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Link href="/posts" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          返回文章列表
        </Link>

        {/* 文章头部 */}
        <article className="prose prose-lg max-w-none">
          {/* 标题 */}
          <h1 className="text-4xl font-bold leading-tight mb-4">{post.title}</h1>

          {/* 文章元信息 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 not-prose">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <Link
                href={`/authors/${post.author.username}`}
                className="hover:text-foreground"
              >
                {post.author.displayName}
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{post.views} 次浏览</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post._count.comments} 条评论</span>
            </div>
          </div>

          {/* 分类和标签 */}
          <div className="flex items-center gap-2 mb-6 not-prose">
            {post.category && (
              <Link href={`/categories/${post.category.slug}`}>
                <Badge variant="default" className="hover:bg-primary/80">
                  {post.category.name}
                </Badge>
              </Link>
            )}
            {post.tags && post.tags.map((tagItem) => (
              <Link key={tagItem.tag.id} href={`/tags/${tagItem.tag.slug}`}>
                <Badge variant="outline" className="hover:bg-accent">
                  #{tagItem.tag.name}
                </Badge>
              </Link>
            ))}
          </div>

          {/* 封面图片 */}
          {post.coverImage && (
            <div className="relative w-full h-64 md:h-96 mb-8 not-prose">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}

          {/* 文章内容 */}
          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* 文章底部操作 */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center gap-2"
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  {likeCount} 点赞
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  分享
                </Button>
              </div>

              {/* 作者信息 */}
              <div className="flex items-center gap-3">
                {post.author.avatar && (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.displayName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{post.author.displayName}</p>
                  {post.author.bio && (
                    <p className="text-sm text-muted-foreground">{post.author.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 评论区域 */}
        <div className="mt-8">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}