'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { Category, Post } from '@/types';
import { categoryApi } from '@/lib/blog-api';
import { PostCard } from '@/components/blog/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Folder } from 'lucide-react';
import Link from 'next/link';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [category, setCategory] = useState<Category & { posts: Post[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const response = await categoryApi.getCategoryBySlug(params.slug);

        if (response.success && response.data) {
          setCategory(response.data);
        } else {
          notFound();
        }
      } catch (error) {
        console.error('获取分类失败:', error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return notFound();
  }

  return (
    <div className="container py-8">
      {/* 返回按钮 */}
      <Link href="/categories" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        返回分类列表
      </Link>

      {/* 分类信息 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Folder className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <Badge variant="secondary">
            {category._count?.posts || category.posts?.length || 0} 篇文章
          </Badge>
        </div>

        {category.description && (
          <p className="text-lg text-muted-foreground mb-4">
            {category.description}
          </p>
        )}
      </div>

      {/* 文章列表 */}
      {category.posts && category.posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {category.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">暂无文章</h3>
          <p className="text-muted-foreground">
            此分类下还没有发布任何文章
          </p>
        </div>
      )}
    </div>
  );
}