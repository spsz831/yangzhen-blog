'use client';

import { useEffect, useState } from 'react';
import { Post } from '@/types';
import { postApi } from '@/lib/blog-api';
import { PostCard } from '@/components/blog/PostCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);

        // 获取置顶文章
        const featuredResponse = await postApi.getPosts({
          published: true,
          featured: true,
          limit: 3,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        // 获取最新文章
        const recentResponse = await postApi.getPosts({
          published: true,
          limit: 6,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        if (featuredResponse.success && featuredResponse.data) {
          setFeaturedPosts(featuredResponse.data.data);
        }

        if (recentResponse.success && recentResponse.data) {
          setRecentPosts(recentResponse.data.data);
        }
      } catch (error) {
        console.error('获取文章失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="container py-8">
      {/* 英雄区域 */}
      <section className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          欢迎来到 YangZhen 的博客
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          在这里分享技术、思考和生活，记录成长路上的点点滴滴
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/posts">
            <Button size="lg">
              探索文章
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg">
              了解更多
            </Button>
          </Link>
        </div>
      </section>

      {/* 置顶文章 */}
      {(featuredPosts.length > 0 || isLoading) && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">置顶文章</h2>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 最新文章 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">最新文章</h2>
          <Link href="/posts">
            <Button variant="outline">
              查看全部
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : recentPosts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">暂无文章发布</p>
          </div>
        )}
      </section>
    </div>
  );
}
