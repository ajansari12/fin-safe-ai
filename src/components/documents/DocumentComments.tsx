
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentManagementService } from "@/services/document-management-service";
import { MessageSquare, Reply, CheckCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface DocumentCommentsProps {
  documentId: string;
}

const DocumentComments: React.FC<DocumentCommentsProps> = ({ documentId }) => {
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<"general" | "review" | "approval" | "revision_request">("general");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['document-comments', documentId],
    queryFn: () => documentManagementService.getComments(documentId)
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: any) => documentManagementService.addComment(documentId, data),
    onSuccess: () => {
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['document-comments', documentId] });
      setNewComment("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addCommentMutation.mutate({
      comment_text: newComment.trim(),
      comment_type: commentType,
      is_resolved: false
    });
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'approval': return 'bg-green-100 text-green-800';
      case 'revision_request': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'review': return <Clock className="h-4 w-4" />;
      case 'approval': return <CheckCircle className="h-4 w-4" />;
      case 'revision_request': return <Reply className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Add Comment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Comment Type</label>
              <select
                value={commentType}
                onChange={(e) => setCommentType(e.target.value as any)}
                className="w-full border rounded px-3 py-2 mt-1"
              >
                <option value="general">General Comment</option>
                <option value="review">Review Comment</option>
                <option value="approval">Approval Comment</option>
                <option value="revision_request">Revision Request</option>
              </select>
            </div>

            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment..."
              rows={4}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={addCommentMutation.isPending || !newComment.trim()}>
                {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
        
        {comments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">No comments yet</h4>
              <p className="text-muted-foreground">
                Be the first to comment on this document
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.created_by_name || 'Unknown User'}</span>
                    <Badge className={getCommentTypeColor(comment.comment_type)}>
                      {getCommentTypeIcon(comment.comment_type)}
                      {comment.comment_type.replace('_', ' ')}
                    </Badge>
                    {comment.is_resolved && (
                      <Badge variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at))} ago
                  </span>
                </div>

                <p className="text-sm whitespace-pre-wrap">{comment.comment_text}</p>

                {comment.is_resolved && comment.resolved_by_name && (
                  <div className="mt-3 p-2 bg-green-50 rounded text-sm">
                    <span className="text-green-800">
                      Resolved by {comment.resolved_by_name} on{' '}
                      {comment.resolved_at && new Date(comment.resolved_at).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" size="sm">
                    <Reply className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                  {!comment.is_resolved && comment.comment_type !== 'general' && (
                    <Button variant="ghost" size="sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentComments;
