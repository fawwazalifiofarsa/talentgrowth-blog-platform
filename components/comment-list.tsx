import { CommentItem } from "@/components/comment-item";
import { EmptyState } from "@/components/empty-state";
import type { Comment } from "@/lib/api/client";

export function CommentList({
  comments,
  postId,
  currentUserId,
}: {
  comments: Comment[];
  postId: string;
  currentUserId?: string;
}) {
  if (comments.length === 0) {
    return (
      <EmptyState
        title="No comments yet."
        message="No comments yet. Be the first to comment."
      />
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
