'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Post, PostFilters as PostFiltersType } from '@/types';
import { postApi } from '@/lib/blog-api';
import { PostCard } from '@/components/blog/PostCard';
import { SearchBar } from '@/components/search/SearchBar';
import { PostFilters } from '@/components/search/PostFilters';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, Search as SearchIcon } from 'lucide-react';

export default function PostsPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);

        const filters: PostFiltersType = {
          page: Number(searchParams.get('page')) || 1,
          limit: 12,
          search: searchParams.get('search') || undefined,
          category: searchParams.get('category') || undefined,
          tag: searchParams.get('tag') || undefined,
          sortBy: searchParams.get('sortBy') || 'createdAt',
          sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
          published: true,
        };

        const response = await postApi.getPosts(filters);

        if (response.success && response.data) {
          setPosts(response.data.data);
          setPagination({
            total: response.data.total,
            page: response.data.page,
            limit: response.data.limit,
            totalPages: response.data.totalPages,
          });
        }
      } catch (error) {
        console.error('获取文章失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [searchParams]);

  const searchQuery = searchParams.get('search');
  const categoryFilter = searchParams.get('category');
  const tagFilter = searchParams.get('tag');

  return (
    <div className="container py-8">
      {/* 页面标题和搜索 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">文章列表</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <SearchBar className="w-full md:w-96" />

          {/* 搜索结果状态 */}
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              '搜索中...'
            ) : (
              `共找到 ${pagination.total} 篇文章`
            )}
          </div>
        </div>

        {/* 当前筛选条件显示 */}
        {(searchQuery || categoryFilter || tagFilter) && (
          <div className="flex items-center gap-2 mt-4">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">当前筛选:</span>
            {searchQuery && (
              <Badge variant="default">搜索: {searchQuery}</Badge>
            )}
            {categoryFilter && (
              <Badge variant="secondary">分类: {categoryFilter}</Badge>
            )}
            {tagFilter && (
              <Badge variant="outline">标签: {tagFilter}</Badge>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 侧边栏筛选 */}
        <div className="lg:col-span-1">
          <PostFilters />
        </div>

        {/* 文章列表 */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {/* 分页 */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    baseUrl="/posts"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">没有找到相关文章</h3>
              <p className="text-muted-foreground">
                {searchQuery || categoryFilter || tagFilter
                  ? '尝试调整搜索条件或筛选器'
                  : '暂无文章发布'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}