
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageSquare, 
  Video, 
  BookOpen,
  Heart,
  Star,
  Phone,
  Share,
  Award,
  Lightbulb,
  HelpCircle,
  ThumbsUp
} from "lucide-react";

const CollaborativeLearning = () => {
  const mentorshipProgram = {
    activePairs: 45,
    mentorRequests: 12,
    successRate: 89,
    avgSessionDuration: "35 min"
  };

  const mentors = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Senior Risk Manager",
      expertise: ["Risk Assessment", "Compliance", "Analytics"],
      rating: 4.9,
      sessions: 23,
      availability: "Available",
      avatar: "SC"
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      role: "Compliance Director",
      expertise: ["Regulatory Compliance", "Audit Prep", "Documentation"],
      rating: 4.8,
      sessions: 31,
      availability: "Busy",
      avatar: "MR"
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "Operations Lead",
      expertise: ["Incident Management", "Workflows", "Team Training"],
      rating: 4.7,
      sessions: 18,
      availability: "Available",
      avatar: "ED"
    }
  ];

  const communityForums = [
    {
      id: 1,
      title: "Risk Assessment Best Practices",
      category: "Risk Management",
      posts: 127,
      participants: 89,
      lastActivity: "2 hours ago",
      trending: true
    },
    {
      id: 2,
      title: "New Feature Discussions",
      category: "Product Updates",
      posts: 45,
      participants: 67,
      lastActivity: "30 minutes ago",
      trending: false
    },
    {
      id: 3,
      title: "Compliance Q&A",
      category: "Compliance",
      posts: 203,
      participants: 156,
      lastActivity: "1 hour ago",
      trending: true
    }
  ];

  const userGeneratedContent = [
    {
      id: 1,
      title: "Advanced Risk Scoring Techniques",
      author: "David Kim",
      type: "Tutorial",
      likes: 45,
      views: 234,
      difficulty: "Advanced",
      duration: "12 min",
      tags: ["Risk", "Analytics", "Best Practices"]
    },
    {
      id: 2,
      title: "Quick Guide: Setting Up Automated Alerts",
      author: "Lisa Wang",
      type: "How-to Guide",
      likes: 67,
      views: 456,
      difficulty: "Beginner",
      duration: "5 min",
      tags: ["Alerts", "Setup", "Quick Tips"]
    },
    {
      id: 3,
      title: "Case Study: Incident Response Success",
      author: "Robert Taylor",
      type: "Case Study",
      likes: 23,
      views: 189,
      difficulty: "Intermediate",
      duration: "8 min",
      tags: ["Incident", "Case Study", "Success Story"]
    }
  ];

  const supportChannels = [
    {
      name: "Live Chat Support",
      status: "online",
      avgResponse: "< 2 min",
      satisfaction: 4.6,
      description: "Instant help with technical questions"
    },
    {
      name: "Expert Video Calls",
      status: "available",
      avgResponse: "15 min",
      satisfaction: 4.8,
      description: "Screen sharing sessions with specialists"
    },
    {
      name: "Community Q&A",
      status: "active",
      avgResponse: "45 min",
      satisfaction: 4.3,
      description: "Peer-to-peer help and knowledge sharing"
    }
  ];

  const expertSessions = [
    {
      id: 1,
      title: "Advanced Analytics Workshop",
      expert: "Dr. Jennifer Park",
      date: "July 15, 2024",
      time: "2:00 PM EST",
      duration: "60 min",
      participants: 23,
      maxParticipants: 30,
      level: "Advanced"
    },
    {
      id: 2,
      title: "Compliance Best Practices",
      expert: "Mark Stevens",
      date: "July 18, 2024",
      time: "11:00 AM EST",
      duration: "45 min",
      participants: 15,
      maxParticipants: 25,
      level: "Intermediate"
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="mentorship" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mentorship">Peer Mentoring</TabsTrigger>
          <TabsTrigger value="community">Community Forums</TabsTrigger>
          <TabsTrigger value="support">Live Support</TabsTrigger>
          <TabsTrigger value="content">User Content</TabsTrigger>
        </TabsList>

        <TabsContent value="mentorship" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Program Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{mentorshipProgram.activePairs}</div>
                  <div className="text-sm text-muted-foreground">Active Mentoring Pairs</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="text-sm font-medium">{mentorshipProgram.successRate}%</span>
                  </div>
                  <Progress value={mentorshipProgram.successRate} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div>
                    <div className="font-medium">{mentorshipProgram.mentorRequests}</div>
                    <div className="text-muted-foreground">Pending Requests</div>
                  </div>
                  <div>
                    <div className="font-medium">{mentorshipProgram.avgSessionDuration}</div>
                    <div className="text-muted-foreground">Avg Session</div>
                  </div>
                </div>
                
                <Button className="w-full">Request a Mentor</Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Available Mentors
                </CardTitle>
                <CardDescription>
                  Connect with experienced users for personalized guidance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mentors.map((mentor) => (
                    <div key={mentor.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-medium">
                            {mentor.avatar}
                          </div>
                          <div>
                            <h4 className="font-medium">{mentor.name}</h4>
                            <p className="text-sm text-muted-foreground">{mentor.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={mentor.availability === "Available" ? "default" : "secondary"}>
                            {mentor.availability}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{mentor.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {mentor.sessions} mentoring sessions
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" disabled={mentor.availability !== "Available"}>
                            Connect
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Upcoming Expert Sessions
              </CardTitle>
              <CardDescription>
                Live sessions with platform experts and industry professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expertSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        <p className="text-sm text-muted-foreground">by {session.expert}</p>
                      </div>
                      <Badge>{session.level}</Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <p><strong>Date:</strong> {session.date}</p>
                      <p><strong>Time:</strong> {session.time}</p>
                      <p><strong>Duration:</strong> {session.duration}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {session.participants}/{session.maxParticipants} registered
                      </span>
                      <Button size="sm">Register</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Community Forums
              </CardTitle>
              <CardDescription>
                Connect with peers, share knowledge, and get expert guidance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button>Create New Post</Button>
                  <Button variant="outline">Browse Categories</Button>
                  <Button variant="outline">My Posts</Button>
                </div>

                <div className="space-y-4">
                  {communityForums.map((forum) => (
                    <div key={forum.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{forum.title}</h4>
                            {forum.trending && (
                              <Badge className="bg-orange-500">🔥 Trending</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{forum.category}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{forum.lastActivity}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{forum.posts} posts</span>
                          <span>{forum.participants} participants</span>
                        </div>
                        <Button size="sm" variant="outline">Join Discussion</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Support Channels
                </CardTitle>
                <CardDescription>
                  Multiple ways to get help when you need it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportChannels.map((channel, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{channel.name}</h4>
                          <p className="text-sm text-muted-foreground">{channel.description}</p>
                        </div>
                        <Badge variant={channel.status === "online" ? "default" : "secondary"}>
                          {channel.status}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Response time: </span>
                          <span className="font-medium">{channel.avgResponse}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{channel.satisfaction}</span>
                        </div>
                      </div>
                      
                      <Button className="w-full">
                        {channel.name === "Live Chat Support" && <MessageSquare className="h-4 w-4 mr-2" />}
                        {channel.name === "Expert Video Calls" && <Video className="h-4 w-4 mr-2" />}
                        {channel.name === "Community Q&A" && <Users className="h-4 w-4 mr-2" />}
                        Start {channel.name}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button className="w-full justify-start">
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Screen Share Session
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask the Community
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Help Articles
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Submit Feature Request
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">💡 Need Help?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Our support team is here to help you succeed. Choose the option that works best for you.
                  </p>
                  <Button size="sm" className="w-full">Get Help Now</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                User-Generated Content
              </CardTitle>
              <CardDescription>
                Tips, tutorials, and best practices shared by the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button>Share Your Knowledge</Button>
                  <Button variant="outline">Filter Content</Button>
                  <Button variant="outline">Most Popular</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userGeneratedContent.map((content) => (
                    <Card key={content.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline">{content.type}</Badge>
                          <Badge variant={content.difficulty === "Beginner" ? "secondary" : content.difficulty === "Advanced" ? "destructive" : "default"}>
                            {content.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">{content.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">by {content.author}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {content.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>{content.duration} read</span>
                          <span>{content.views} views</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{content.likes}</span>
                          </div>
                          <Button size="sm">Read More</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Content Creator Program
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500">500+</div>
                        <div className="text-sm text-muted-foreground">Community Contributors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">1.2k</div>
                        <div className="text-sm text-muted-foreground">Shared Resources</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">95%</div>
                        <div className="text-sm text-muted-foreground">Helpful Rating</div>
                      </div>
                    </div>
                    <Button className="w-full mt-4">
                      <Award className="h-4 w-4 mr-2" />
                      Join Creator Program
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborativeLearning;
