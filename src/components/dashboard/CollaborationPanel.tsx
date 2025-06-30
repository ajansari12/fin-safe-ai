
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Share2, 
  Users, 
  MessageCircle, 
  Eye, 
  Download, 
  Send,
  X,
  Plus
} from "lucide-react";

interface CollaborationPanelProps {
  userRole: string;
  onClose: () => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  userRole,
  onClose
}) => {
  const [comment, setComment] = useState("");
  const [shareEmail, setShareEmail] = useState("");

  const activeUsers = [
    { id: 1, name: "John Smith", role: "Risk Manager", avatar: "/avatars/john.jpg", status: "online" },
    { id: 2, name: "Sarah Johnson", role: "Analyst", avatar: "/avatars/sarah.jpg", status: "viewing" },
    { id: 3, name: "Mike Davis", role: "Auditor", avatar: "/avatars/mike.jpg", status: "away" }
  ];

  const sharedDashboards = [
    { id: 1, name: "Executive Overview", owner: "CEO Office", viewers: 12, lastUpdated: "2 hours ago" },
    { id: 2, name: "Risk Assessment Q1", owner: "Risk Team", viewers: 8, lastUpdated: "1 day ago" },
    { id: 3, name: "Compliance Dashboard", owner: "Audit Team", viewers: 15, lastUpdated: "3 hours ago" }
  ];

  const comments = [
    {
      id: 1,
      user: "Sarah Johnson",
      time: "2 hours ago",
      content: "The operational risk metrics show concerning trends in Q4. Should we schedule a review?",
      widget: "Risk Heatmap"
    },
    {
      id: 2,
      user: "Mike Davis", 
      time: "4 hours ago",
      content: "Great improvement in compliance scores this quarter.",
      widget: "Compliance Status"
    },
    {
      id: 3,
      user: "John Smith",
      time: "1 day ago", 
      content: "KRI breach in third-party services needs immediate attention.",
      widget: "Executive Scorecard"
    }
  ];

  const handleShare = () => {
    console.log("Sharing dashboard with:", shareEmail);
    setShareEmail("");
  };

  const handleComment = () => {
    console.log("Adding comment:", comment);
    setComment("");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Collaboration Hub
            </CardTitle>
            <CardDescription>
              Share dashboards, collaborate with team members, and manage access
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active Users</TabsTrigger>
            <TabsTrigger value="shared">Shared Views</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="share">Share & Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Currently Online</h3>
              <div className="space-y-3">
                {activeUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                          user.status === "online" ? "bg-green-500" :
                          user.status === "viewing" ? "bg-blue-500" : "bg-gray-400"
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{user.name}</h4>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    <Badge variant={user.status === "online" ? "default" : "secondary"}>
                      {user.status === "viewing" ? "Viewing Dashboard" : user.status}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Real-time Activity</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Eye className="h-3 w-3" />
                    <span>Sarah Johnson is viewing Risk Heatmap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-3 w-3" />
                    <span>Mike Davis added a comment on Compliance Status</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="shared" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Shared Dashboards</h3>
                <Button size="sm">
                  <Plus className="h-3 w-3 mr-1" />
                  Create Shared View
                </Button>
              </div>
              
              <div className="space-y-3">
                {sharedDashboards.map((dashboard) => (
                  <div key={dashboard.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{dashboard.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>By {dashboard.owner}</span>
                        <span>{dashboard.viewers} viewers</span>
                        <span>Updated {dashboard.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Dashboard Comments</h3>
                <Badge variant="outline">{comments.length} comments</Badge>
              </div>
              
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 border rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{comment.user}</h4>
                        <Badge variant="secondary" className="text-xs">{comment.widget}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t space-y-2">
                <h4 className="font-medium">Add Comment</h4>
                <Textarea
                  placeholder="Share your insights about this dashboard..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button onClick={handleComment} disabled={!comment.trim()}>
                  <Send className="h-3 w-3 mr-1" />
                  Add Comment
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="share" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Share Dashboard</h3>
              
              <div className="space-y-4 p-4 border rounded">
                <h4 className="font-medium">Invite Team Members</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                  <Button onClick={handleShare} disabled={!shareEmail.trim()}>
                    <Send className="h-3 w-3 mr-1" />
                    Invite
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4 p-4 border rounded">
                <h4 className="font-medium">Export Options</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Export PDF
                  </Button>
                  <Button variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Export Excel
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-3 w-3 mr-1" />
                    Share Link
                  </Button>
                  <Button variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Schedule Report
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4 p-4 border rounded">
                <h4 className="font-medium">Access Permissions</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">View Only</span>
                    <Badge variant="secondary">Default</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Comment & Collaborate</span>
                    <Badge variant="outline">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Edit Dashboard</span>
                    <Badge variant="outline">Admin Only</Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CollaborationPanel;
