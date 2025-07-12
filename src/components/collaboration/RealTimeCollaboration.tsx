
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  Edit3, 
  Share2, 
  Eye,
  Circle,
  Wifi,
  WifiOff
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { collaborationService, type CollaborationSession, type Participant } from '@/services/collaboration-service';
import { toast } from 'sonner';

const RealTimeCollaboration: React.FC = () => {
  const { profile } = useAuth();
  const [activeSessions, setActiveSessions] = useState<CollaborationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadActiveSessions();
    setupRealtimeSubscriptions();
    
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [profile?.organization_id]);

  // Load comments when current session changes
  useEffect(() => {
    if (currentSession?.document_id) {
      loadComments();
    }
  }, [currentSession?.document_id]);

  const loadActiveSessions = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data: sessions, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('org_id', profile.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sessionsWithParticipants: CollaborationSession[] = (sessions || []).map(session => ({
        id: session.id,
        org_id: session.org_id,
        document_id: session.document_id,
        session_type: session.session_type as CollaborationSession['session_type'],
        participants: (session.participants || []) as Participant[],
        session_data: session.session_data || {},
        is_active: session.is_active,
        created_by: session.created_by,
        created_at: session.created_at,
        updated_at: session.updated_at
      }));

      setActiveSessions(sessionsWithParticipants);
      if (sessionsWithParticipants.length > 0) {
        setCurrentSession(sessionsWithParticipants[0]);
        setParticipants(sessionsWithParticipants[0].participants);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load collaboration sessions');
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!profile?.organization_id) return;

    // Subscribe to collaboration updates
    const collaborationChannel = supabase
      .channel(`collaboration:${profile.organization_id}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = collaborationChannel.presenceState();
        updateParticipantsFromPresence(presenceState);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(collaborationChannel);
    };
  };

  const updateParticipantsFromPresence = (presenceState: any) => {
    const updatedParticipants: Participant[] = [];
    Object.keys(presenceState).forEach(userId => {
      const presence = presenceState[userId][0];
      updatedParticipants.push({
        user_id: userId,
        user_name: presence.user_name,
        role: presence.role,
        joined_at: presence.joined_at,
        last_activity: presence.last_activity,
        status: presence.status,
        cursor_position: presence.cursor_position
      });
    });
    setParticipants(updatedParticipants);
  };

  const createNewSession = async (type: CollaborationSession['session_type']) => {
    try {
      const session = await collaborationService.createCollaborationSession(type);
      setActiveSessions(prev => [session, ...prev]);
      setCurrentSession(session);
      toast.success('New collaboration session created');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create collaboration session');
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      await collaborationService.joinSession(sessionId);
      const session = activeSessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
      }
      toast.success('Joined collaboration session');
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session');
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !currentSession?.document_id || !profile?.organization_id) return;

    try {
      const { error } = await supabase
        .from('document_comments')
        .insert({
          org_id: profile.organization_id,
          document_id: currentSession.document_id,
          author_id: profile.id,
          author_name: profile.full_name || 'Unknown User',
          content: newComment
        });

      if (error) throw error;

      setNewComment('');
      toast.success('Comment added');
      // Reload comments
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const loadComments = async () => {
    if (!currentSession?.document_id) return;

    try {
      const { data, error } = await supabase
        .from('document_comments')
        .select('*')
        .eq('document_id', currentSession.document_id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const getStatusColor = (status: Participant['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: Participant['status']) => {
    return status === 'online' ? Wifi : WifiOff;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-Time Collaboration</h2>
          <p className="text-muted-foreground">
            Collaborate in real-time with live editing, comments, and presence indicators
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => createNewSession('document_editing')}>
            <Edit3 className="h-4 w-4 mr-2" />
            New Document Session
          </Button>
          <Button variant="outline" onClick={() => createNewSession('whiteboard')}>
            <Share2 className="h-4 w-4 mr-2" />
            New Whiteboard
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card className={`border-l-4 ${isOnline ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
              {isOnline ? 'Connected - Real-time collaboration active' : 'Offline - Changes will sync when reconnected'}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active collaboration sessions</p>
                  <p className="text-sm">Start a new session to begin collaborating</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        currentSession?.id === session.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentSession(session)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {session.session_data?.document_title || `${session.session_type} Session`}
                        </h4>
                        <Badge variant="secondary">
                          {session.participants.length} participants
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={session.session_type === 'document_editing' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {session.session_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Active for {Math.floor((Date.now() - new Date(session.created_at).getTime()) / 60000)}m
                        </span>
                      </div>
                      <div className="flex -space-x-2 mt-2">
                        {session.participants.slice(0, 3).map((participant) => (
                          <div key={participant.user_id} className="relative">
                            <Avatar className="h-6 w-6 border-2 border-white">
                              <AvatarFallback className="text-xs">
                                {participant.user_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div 
                              className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${getStatusColor(participant.status)}`}
                            />
                          </div>
                        ))}
                        {session.participants.length > 3 && (
                          <div className="flex items-center justify-center h-6 w-6 bg-gray-200 border-2 border-white rounded-full text-xs">
                            +{session.participants.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          {currentSession && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Discussion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                  {comments.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Start the conversation</p>
                    </div>
                  ) : (
                    comments.map((comment, index) => (
                      <div key={comment.id || index} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {comment.author_name?.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{comment.author_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString()} at{' '}
                              {new Date(comment.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                    rows={2}
                  />
                  <Button onClick={addComment} disabled={!newComment.trim()}>
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Participants Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Who's Here
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No one else is here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((participant) => {
                    const StatusIcon = getStatusIcon(participant.status);
                    return (
                      <div key={participant.user_id} className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {participant.user_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div 
                            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(participant.status)}`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">
                              {participant.user_name}
                              {participant.user_id === profile?.id && ' (You)'}
                            </h4>
                            <StatusIcon className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {participant.role} • {participant.status}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Active {Math.floor((Date.now() - new Date(participant.last_activity).getTime()) / 60000)}m ago
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Collaboration Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => createNewSession('whiteboard')}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Start Whiteboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => createNewSession('meeting')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Start Meeting
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealTimeCollaboration;
