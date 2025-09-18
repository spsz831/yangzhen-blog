'use client';

import { useEffect, useState } from 'react';
import { Category } from '@/types';
import { categoryApi } from '@/lib/blog-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Folder, FileText } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await categoryApi.getCategories({ limit: 50 });

        if (response.success && response.data) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('获取分类失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Folder className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">文章分类</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          浏览不同主题的文章内容
        </p>
      </div>

      {/* 分类网格 */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Folder
                        className="h-5 w-5"
                        style={{ color: category.color || undefined }}
                      />
                      {category.name}
                    </span>
                    <Badge variant="secondary">
                      {category._count?.posts || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {category.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {category.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      暂无描述
                    </p>
                  )}

                  <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>{category._count?.posts || 0} 篇文章</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">暂无分类</h3>
          <p className="text-muted-foreground">
            还没有创建任何文章分类
          </p>
        </div>
      )}
    </div>
  );
}