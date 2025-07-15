
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface CollaborationSession {
  id: string;
  org_id: string;
  document_id?: string;
  session_type: 'document_editing' | 'whiteboard' | 'meeting' | 'discussion';
  participants: Participant[];
  session_data: Record<string, any>;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  user_id: string;
  user_name: string;
  role: string;
  joined_at: string;
  last_activity: string;
  status: 'online' | 'away' | 'offline';
  cursor_position?: { x: number; y: number };
  current_selection?: string;
}

export interface Comment {
  id: string;
  org_id: string;
  document_id?: string;
  parent_comment_id?: string;
  thread_id: string;
  content: string;
  mentions: string[];
  attachments: any[];
  reactions: Record<string, string[]>;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  org_id: string;
  recipient_id: string;
  sender_id?: string;
  notification_type: 'workflow' | 'mention' | 'deadline' | 'escalation' | 'system';
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  channels: ('email' | 'in_app' | 'sms' | 'slack')[];
  metadata: Record<string, any>;
  read_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface ExternalStakeholder {
  id: string;
  org_id: string;
  email: string;
  name: string;
  organization: string;
  role: string;
  access_level: 'view' | 'comment' | 'edit';
  permitted_modules: string[];
  access_expires_at?: string;
  last_login_at?: string;
  is_active: boolean;
  invited_by?: string;
  created_at: string;
  updated_at: string;
}

class CollaborationService {
  // Real-Time Collaboration
  async createCollaborationSession(
    type: CollaborationSession['session_type'],
    documentId?: string,
    initialData?: Record<string, any>
  ): Promise<CollaborationSession> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const participantData: Participant = {
      user_id: profile.id,
      user_name: profile.full_name || 'Unknown User',
      role: profile.role,
      joined_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      status: 'online'
    };

    const sessionData = {
      org_id: profile.organization_id,
      document_id: documentId,
      session_type: type,
      participants: [participantData] as any, // Cast to any for JSON compatibility
      session_data: initialData || {} as any,
      is_active: true,
      created_by: profile.id
    };

    const { data, error } = await supabase
      .from('collaboration_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      participants: data.participants as unknown as Participant[],
      session_data: data.session_data as unknown as Record<string, any>
    } as CollaborationSession;
  }

  async joinSession(sessionId: string): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile) throw new Error('No user profile found');

    // Update session with new participant
    const { data: session } = await supabase
      .from('collaboration_sessions')
      .select('participants')
      .eq('id', sessionId)
      .single();

    if (session) {
      const currentParticipants = session.participants as unknown as Participant[];
      const updatedParticipants = [
        ...currentParticipants.filter((p: Participant) => p.user_id !== profile.id),
        {
          user_id: profile.id,
          user_name: profile.full_name || 'Unknown User',
          role: profile.role,
          joined_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          status: 'online'
        }
      ];

      await supabase
        .from('collaboration_sessions')
        .update({ participants: updatedParticipants as any })
        .eq('id', sessionId);
    }
  }

  async updatePresence(sessionId: string, status: Participant['status'], cursorPosition?: { x: number; y: number }): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile) return;

    const { data: session } = await supabase
      .from('collaboration_sessions')
      .select('participants')
      .eq('id', sessionId)
      .single();

    if (session) {
      const currentParticipants = session.participants as unknown as Participant[];
      const updatedParticipants = currentParticipants.map((p: Participant) =>
        p.user_id === profile.id
          ? {
              ...p,
              status,
              last_activity: new Date().toISOString(),
              cursor_position: cursorPosition
            }
          : p
      );

      await supabase
        .from('collaboration_sessions')
        .update({ participants: updatedParticipants as any })
        .eq('id', sessionId);
    }
  }

  // Comments and Discussions
  async addComment(
    documentId: string,
    content: string,
    parentCommentId?: string,
    mentions?: string[]
  ): Promise<Comment> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const threadId = parentCommentId || crypto.randomUUID();

    const comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'> = {
      org_id: profile.organization_id,
      document_id: documentId,
      parent_comment_id: parentCommentId,
      thread_id: threadId,
      content,
      mentions: mentions || [],
      attachments: [],
      reactions: {},
      is_resolved: false,
      created_by: profile.id,
      created_by_name: profile.full_name
    };

    const { data, error } = await supabase
      .from('collaboration_comments')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;

    // Send notifications for mentions
    if (mentions && mentions.length > 0) {
      await this.sendMentionNotifications(mentions, content, documentId);
    }

    return data as Comment;
  }

  async getComments(documentId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('collaboration_comments')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as Comment[];
  }

  async resolveComment(commentId: string): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile) return;

    await supabase
      .from('collaboration_comments')
      .update({
        is_resolved: true,
        resolved_by: profile.id,
        resolved_at: new Date().toISOString()
      })
      .eq('id', commentId);
  }

  // Notifications
  async sendNotification(
    recipientId: string,
    type: Notification['notification_type'],
    title: string,
    message: string,
    urgency: Notification['urgency'] = 'medium',
    metadata?: Record<string, any>
  ): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const notification: Omit<Notification, 'id' | 'created_at'> = {
      org_id: profile.organization_id,
      recipient_id: recipientId,
      sender_id: profile.id,
      notification_type: type,
      title,
      message,
      urgency,
      channels: this.getNotificationChannels(urgency),
      metadata: metadata || {}
    };

    await supabase
      .from('collaboration_notifications')
      .insert(notification);

    // Send real-time notification
    await supabase
      .channel(`notifications:${recipientId}`)
      .send({
        type: 'broadcast',
        event: 'new_notification',
        payload: notification
      });
  }

  private async sendMentionNotifications(mentions: string[], content: string, documentId: string): Promise<void> {
    for (const userId of mentions) {
      await this.sendNotification(
        userId,
        'mention',
        'You were mentioned in a comment',
        content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        'medium',
        { document_id: documentId }
      );
    }
  }

  private getNotificationChannels(urgency: Notification['urgency']): ('email' | 'in_app' | 'sms' | 'slack')[] {
    switch (urgency) {
      case 'critical':
        return ['email', 'in_app', 'sms', 'slack'];
      case 'high':
        return ['email', 'in_app', 'slack'];
      case 'medium':
        return ['in_app', 'email'];
      case 'low':
      default:
        return ['in_app'];
    }
  }

  // External Stakeholder Management
  async inviteExternalStakeholder(
    email: string,
    name: string,
    organization: string,
    role: string,
    accessLevel: ExternalStakeholder['access_level'],
    permittedModules: string[],
    expiresInDays?: number
  ): Promise<ExternalStakeholder> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const stakeholder: Omit<ExternalStakeholder, 'id' | 'created_at' | 'updated_at'> = {
      org_id: profile.organization_id,
      email,
      name,
      organization,
      role,
      access_level: accessLevel,
      permitted_modules: permittedModules,
      access_expires_at: expiresAt,
      is_active: true,
      invited_by: profile.id
    };

    const { data, error } = await supabase
      .from('external_stakeholders')
      .insert(stakeholder)
      .select()
      .single();

    if (error) throw error;

    // Send invitation email
    await this.sendStakeholderInvitation(email, name, organization);

    return data as ExternalStakeholder;
  }

  async getExternalStakeholders(): Promise<ExternalStakeholder[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('external_stakeholders')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []) as ExternalStakeholder[];
  }

  private async sendStakeholderInvitation(email: string, name: string, organization: string): Promise<void> {
    try {
      await supabase.functions.invoke('send-email-notification', {
        body: {
          to: [email],
          subject: 'Invitation to ResilientFI Collaboration Platform',
          html: `
            <h2>You're invited to collaborate on ResilientFI</h2>
            <p>Hello ${name},</p>
            <p>You have been invited by ${organization} to collaborate on their risk management activities through ResilientFI.</p>
            <p>Click the link below to accept the invitation and get started:</p>
            <a href="${window.location.origin}/auth/register?invitation=true">Accept Invitation</a>
            <p>This invitation will expire in 7 days.</p>
            <p>Best regards,<br>The ResilientFI Team</p>
          `
        }
      });
    } catch (error) {
      console.error('Failed to send invitation email:', error);
    }
  }

  // Knowledge Base
  async createKnowledgeArticle(
    title: string,
    content: string,
    category: string,
    tags: string[]
  ): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const article = {
      org_id: profile.organization_id,
      title,
      content,
      category,
      tags,
      visibility: 'internal'
    };

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(article)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async searchKnowledge(query: string, category?: string): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    let queryBuilder = supabase
      .from('knowledge_base')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('visibility', 'internal')
      .textSearch('title,content', query);

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) return [];
    return data || [];
  }

  // Meeting Management
  async scheduleMeeting(
    title: string,
    description: string,
    startTime: string,
    endTime: string,
    attendees: string[],
    agenda?: string[]
  ): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const meeting = {
      org_id: profile.organization_id,
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      organizer_id: profile.id,
      organizer_name: profile.full_name,
      attendees,
      agenda: agenda || [],
      status: 'scheduled',
      meeting_type: 'virtual'
    };

    const { data, error } = await supabase
      .from('collaboration_meetings')
      .insert(meeting)
      .select()
      .single();

    if (error) throw error;

    // Send meeting invitations
    for (const attendeeId of attendees) {
      await this.sendNotification(
        attendeeId,
        'workflow',
        `Meeting Invitation: ${title}`,
        `You have been invited to a meeting scheduled for ${new Date(startTime).toLocaleString()}`,
        'medium',
        { meeting_id: data.id }
      );
    }

    return data;
  }

  async getMeetings(startDate?: string, endDate?: string): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    let query = supabase
      .from('collaboration_meetings')
      .select('*')
      .eq('org_id', profile.organization_id);

    if (startDate) {
      query = query.gte('start_time', startDate);
    }
    if (endDate) {
      query = query.lte('end_time', endDate);
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) return [];
    return data || [];
  }

  // Analytics
  async getCollaborationAnalytics(timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
    }

    const [sessions, comments, meetings] = await Promise.all([
      supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('org_id', profile.organization_id)
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('collaboration_comments')
        .select('*')
        .eq('org_id', profile.organization_id)
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('collaboration_meetings')
        .select('*')
        .eq('org_id', profile.organization_id)
        .gte('start_time', startDate.toISOString())
    ]);

    return {
      totalSessions: sessions.data?.length || 0,
      totalComments: comments.data?.length || 0,
      totalMeetings: meetings.data?.length || 0,
      activeUsers: this.getActiveUsers(sessions.data || []),
      sessionsByType: this.groupSessionsByType(sessions.data || []),
      collaborationTrends: this.calculateCollaborationTrends(sessions.data || [], comments.data || [], timeframe)
    };
  }

  private getActiveUsers(sessions: any[]): number {
    const uniqueUsers = new Set();
    sessions.forEach(session => {
      const participants = session.participants as unknown as Participant[];
      participants?.forEach((p: Participant) => uniqueUsers.add(p.user_id));
    });
    return uniqueUsers.size;
  }

  private groupSessionsByType(sessions: any[]): Record<string, number> {
    return sessions.reduce((acc, session) => {
      acc[session.session_type] = (acc[session.session_type] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateCollaborationTrends(sessions: any[], comments: any[], timeframe: string): any[] {
    const groupBy = timeframe === 'week' ? 'day' : timeframe === 'month' ? 'week' : 'month';
    const trends: Record<string, { sessions: number; comments: number }> = {};

    [...sessions, ...comments].forEach(item => {
      const date = new Date(item.created_at || item.start_time);
      const key = groupBy === 'day' 
        ? date.toISOString().split('T')[0]
        : groupBy === 'week'
        ? `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
        : `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!trends[key]) {
        trends[key] = { sessions: 0, comments: 0 };
      }
      
      if (sessions.includes(item)) {
        trends[key].sessions++;
      } else {
        trends[key].comments++;
      }
    });

    return Object.entries(trends).map(([period, data]) => ({
      period,
      ...data
    }));
  }
}

export const collaborationService = new CollaborationService();
