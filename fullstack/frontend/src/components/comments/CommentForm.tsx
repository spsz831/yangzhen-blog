'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { commentApi } from '@/lib/comment-api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onCommentCreated?: (comment: any) => void;
  onCancel?: () => void;
}

export function CommentForm({
  postId,
  parentId,
  placeholder = '写下你的评论...',
  onCommentCreated,
  onCancel
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('请先登录后再评论');
      return;
    }

    if (!content.trim()) {
      setError('评论内容不能为空');
      return;
    }

    if (content.length > 1000) {
      setError('评论内容不能超过1000字符');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await commentApi.createComment({
        content: content.trim(),
        postId,
        parentId,
      });

      if (response.success && response.data) {
        setContent('');
        onCommentCreated?.(response.data);
      } else {
        setError(response.error || '评论发布失败');
      }
    } catch (error: any) {
      setError(error.message || '评论发布失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground mb-4">
            登录后参与讨论
          </p>
          <Button asChild>
            <a href="/auth">立即登录</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">
                {content.length}/1000
              </span>
              {error && (
                <span className="text-sm text-red-600">{error}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              size="sm"
            >
              {isSubmitting ? '发布中...' : (parentId ? '回复' : '发布评论')}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                取消
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}