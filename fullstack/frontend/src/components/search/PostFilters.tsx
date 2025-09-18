'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category, Tag } from '@/types';
import { categoryApi } from '@/lib/blog-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';

export function PostFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSort = searchParams.get('sortBy') || 'createdAt';
  const currentOrder = searchParams.get('sortOrder') || 'desc';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
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

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // 重置页码
    router.push(`/posts?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    params.delete('tag');
    params.delete('sortBy');
    params.delete('sortOrder');
    params.delete('page');
    router.push(`/posts?${params.toString()}`);
  };

  const hasActiveFilters = currentCategory || currentTag || currentSort !== 'createdAt' || currentOrder !== 'desc';

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选条件
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              清除
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 排序选项 */}
        <div>
          <label className="text-sm font-medium mb-2 block">排序方式</label>
          <Select
            value={`${currentSort}-${currentOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-');
              const params = new URLSearchParams(searchParams);
              params.set('sortBy', sortBy);
              params.set('sortOrder', sortOrder);
              params.delete('page');
              router.push(`/posts?${params.toString()}`);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">最新发布</SelectItem>
              <SelectItem value="createdAt-asc">最早发布</SelectItem>
              <SelectItem value="views-desc">浏览量最多</SelectItem>
              <SelectItem value="views-asc">浏览量最少</SelectItem>
              <SelectItem value="title-asc">标题 A-Z</SelectItem>
              <SelectItem value="title-desc">标题 Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 分类筛选 */}
        <div>
          <label className="text-sm font-medium mb-2 block">分类</label>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">加载中...</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={currentCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('category', '')}
              >
                全部
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={currentCategory === category.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('category', category.slug)}
                >
                  {category.name}
                  {category._count && (
                    <Badge variant="secondary" className="ml-2 h-5">
                      {category._count.posts}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* 活跃筛选条件显示 */}
        {hasActiveFilters && (
          <div>
            <label className="text-sm font-medium mb-2 block">当前筛选</label>
            <div className="flex flex-wrap gap-2">
              {currentCategory && (
                <Badge variant="default" className="flex items-center gap-1">
                  分类: {categories.find(c => c.slug === currentCategory)?.name || currentCategory}
                  <button
                    onClick={() => updateFilter('category', '')}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {currentTag && (
                <Badge variant="default" className="flex items-center gap-1">
                  标签: {currentTag}
                  <button
                    onClick={() => updateFilter('tag', '')}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(currentSort !== 'createdAt' || currentOrder !== 'desc') && (
                <Badge variant="outline" className="flex items-center gap-1">
                  排序: {currentSort === 'createdAt' ? '发布时间' : currentSort === 'views' ? '浏览量' : '标题'}
                  ({currentOrder === 'desc' ? '降序' : '升序'})
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}