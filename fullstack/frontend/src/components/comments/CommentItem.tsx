'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types';
import { commentApi } from '@/lib/comment-api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CommentForm } from './CommentForm';
import { Heart, Reply, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

interface CommentItemProps {
  comment: Comment;
  onCommentUpdate: (comment: Comment) => void;
  onCommentDelete: (commentId: string) => void;
  onReplyCreated: (reply: Comment) => void;
}

export function CommentItem({
  comment,
  onCommentUpdate,
  onCommentDelete,
  onReplyCreated
}: CommentItemProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment._count.likes);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
      }
      return `${hours}小时前`;
    }

    if (days < 7) {
      return `${days}天前`;
    }

    return date.toLocaleDateString('zh-CN');
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      const response = await commentApi.toggleCommentLike(comment.id);
      if (response.success && response.data) {
        setIsLiked(response.data.liked);
        setLikeCount(prev => response.data.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }

    setIsUpdating(true);

    try {
      const response = await commentApi.updateComment(comment.id, editContent.trim());
      if (response.success && response.data) {
        onCommentUpdate(response.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('更新评论失败:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      const response = await commentApi.deleteComment(comment.id);
      if (response.success) {
        onCommentDelete(comment.id);
      }
    } catch (error) {
      console.error('删除评论失败:', error);
    }
  };

  const canEditOrDelete = user && (user.id === comment.author.id || user.role === 'ADMIN');

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {/* 用户头像 */}
        <div className="flex-shrink-0">
          {comment.author.avatar ? (
            <Image
              src={comment.author.avatar}
              alt={comment.author.displayName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {comment.author.displayName.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          {/* 用户信息和时间 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.author.displayName}</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
              {comment.updatedAt !== comment.createdAt && (
                <Badge variant="outline" className="text-xs">
                  已编辑
                </Badge>
              )}
            </div>

            {/* 操作菜单 */}
            {canEditOrDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* 评论内容 */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isUpdating}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={isUpdating || !editContent.trim()}
                >
                  {isUpdating ? '保存中...' : '保存'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={isUpdating}
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </div>
          )}

          {/* 操作按钮 */}
          {!isEditing && (
            <div className="flex items-center gap-4 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`h-auto p-1 ${isLiked ? 'text-red-600' : 'text-muted-foreground'}`}
                disabled={!user}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount > 0 && likeCount}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="h-auto p-1 text-muted-foreground"
                disabled={!user}
              >
                <Reply className="h-4 w-4 mr-1" />
                回复
              </Button>
            </div>
          )}

          {/* 回复表单 */}
          {isReplying && (
            <div className="mt-4">
              <CommentForm
                postId={comment.postId}
                parentId={comment.id}
                placeholder={`回复 @${comment.author.displayName}...`}
                onCommentCreated={(reply) => {
                  onReplyCreated(reply);
                  setIsReplying(false);
                }}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}

          {/* 回复列表 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l-2 border-muted pl-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onCommentUpdate={onCommentUpdate}
                  onCommentDelete={onCommentDelete}
                  onReplyCreated={onReplyCreated}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}