'use client';

import { useEffect, useState } from 'react';
import { Comment } from '@/types';
import { commentApi } from '@/lib/comment-api';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchComments = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await commentApi.getCommentsByPost(postId, {
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (response.success && response.data) {
        setComments(response.data.data);
        setPagination({
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        });
      }
    } catch (error) {
      console.error('获取评论失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCommentCreated = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
    setPagination(prev => ({ ...prev, total: prev.total + 1 }));
  };

  const handleCommentUpdate = (updatedComment: Comment) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  const handleCommentDelete = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    setPagination(prev => ({ ...prev, total: prev.total - 1 }));
  };

  const handleReplyCreated = (newReply: Comment) => {
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === newReply.parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      })
    );
  };

  const handlePageChange = (page: number) => {
    fetchComments(page);
  };

  return (
    <div className="space-y-6">
      {/* 评论标题 */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">
          评论 ({pagination.total})
        </h3>
      </div>

      {/* 评论表单 */}
      <CommentForm
        postId={postId}
        onCommentCreated={handleCommentCreated}
      />

      {/* 评论列表 */}
      <div className="space-y-6">
        {isLoading ? (
          // 加载状态
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <>
            {/* 评论项 */}
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onCommentUpdate={handleCommentUpdate}
                onCommentDelete={handleCommentDelete}
                onReplyCreated={handleReplyCreated}
              />
            ))}

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  baseUrl="#"
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          // 空状态
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">还没有评论</h4>
            <p className="text-muted-foreground">
              成为第一个发表评论的人吧！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}