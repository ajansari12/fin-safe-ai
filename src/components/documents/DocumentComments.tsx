
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentManagementService } from '@/services/document-management-service';
import { MessageSquare, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface DocumentCommentsProps {
  documentId: string;
}

const DocumentComments: React.FC<DocumentCommentsProps> = ({ documentId }) => {
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['document-comments', documentId],
    queryFn: () => documentManagementService.getComments(documentId)
  });

  const addCommentMutation = useMutation({
    mutationFn: (commentData: { content: string }) => 
      documentManagementService.addComment(documentId, commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-comments', documentId] });
      setNewComment('');
      toast.success('Comment added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add comment: ' + error.message);
    }
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate({
      content: newComment.trim()
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Comment Form */}
          <div className="space-y-3 mb-6">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                  <div className="h-3 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Comments Yet</h3>
              <p className="text-muted-foreground">
                Be the first to add a comment on this document.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-muted pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {comment.created_by_name || 'Anonymous'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at))} ago
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentComments;
