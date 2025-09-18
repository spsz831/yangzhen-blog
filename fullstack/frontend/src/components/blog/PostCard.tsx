'use client';

import { Post } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, Heart, MessageCircle, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {post.coverImage && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <User className="h-4 w-4" />
          <Link
            href={`/authors/${post.author.username}`}
            className="hover:text-foreground"
          >
            {post.author.displayName}
          </Link>
          <span>•</span>
          <Calendar className="h-4 w-4" />
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <Link href={`/posts/${post.slug}`}>
          <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        {post.excerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{post.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{post._count.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post._count.comments}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.category && (
              <Link href={`/categories/${post.category.slug}`}>
                <Badge variant="secondary" className="hover:bg-secondary/80">
                  {post.category.name}
                </Badge>
              </Link>
            )}
            {post.featured && (
              <Badge variant="default">置顶</Badge>
            )}
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.slice(0, 3).map((tagItem) => (
              <Link
                key={tagItem.tag.id}
                href={`/tags/${tagItem.tag.slug}`}
              >
                <Badge variant="outline" className="text-xs hover:bg-accent">
                  #{tagItem.tag.name}
                </Badge>
              </Link>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}