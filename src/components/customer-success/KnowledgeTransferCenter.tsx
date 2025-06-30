
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Users, 
  Star, 
  CheckCircle,
  TrendingUp,
  FileText,
  Calendar,
  Settings
} from "lucide-react";

const KnowledgeTransferCenter = () => {
  const knowledgeBase = [
    {
      id: 1,
      title: "Risk Assessment Best Practices for Community Banks",
      category: "Risk Management",
      type: "Best Practice Guide",
      source: "FirstNational Bank Implementation",
      views: 234,
      rating: 4.8,
      lastUpdated: "2024-07-15"
    },
    {
      id: 2,
      title: "Automated Incident Response Workflows",
      category: "Incident Management",
      type: "Implementation Guide", 
      source: "Regional Bank Corp",
      views: 189,
      rating: 4.6,
      lastUpdated: "2024-07-10"
    },
    {
      id: 3,
      title: "Regulatory Reporting Optimization Techniques",
      category: "Compliance",
      type: "Case Study",
      source: "Community Credit Union",
      views: 156,
      rating: 4.9,
      lastUpdated: "2024-07-08"
    }
  ];

  const peerLearningPrograms = [
    {
      id: 1,
      name: "Risk Management Leaders Forum",
      type: "Monthly Webinar",
      nextSession: "2024-08-15",
      participants: 47,
      topics: ["AI in Risk Assessment", "Regulatory Updates", "Best Practices Sharing"],
      facilitator: "Sarah Johnson, CRO FirstNational Bank"
    },
    {
      id: 2,
      name: "Compliance Officers Network",
      type: "Quarterly Workshop",
      nextSession: "2024-09-20",
      participants: 32,
      topics: ["Regulatory Changes", "Audit Preparation", "Technology Updates"],
      facilitator: "Michael Chen, Regional Bank Corp"
    }
  ];

  const trainingPrograms = [
    {
      id: 1,
      program: "ResilientFI Certified Risk Analyst",
      level: "Advanced",
      duration: "40 hours",
      participants: 78,
      completionRate: 92,
      nextCohort: "2024-08-01"
    },
    {
      id: 2,
      program: "ResilientFI Administrator Certification",
      level: "Intermediate",
      duration: "24 hours", 
      participants: 124,
      completionRate: 87,
      nextCohort: "2024-07-25"
    },
    {
      id: 3,
      program: "ResilientFI Power User Workshop",
      level: "Beginner",
      duration: "8 hours",
      participants: 203,
      completionRate: 95,
      nextCohort: "2024-07-30"
    }
  ];

  const userCommunity = {
    totalMembers: 1247,
    activeMembers: 892,
    discussions: 234,
    questionsAnswered: 156,
    averageResponseTime: "2.3 hours"
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="knowledge" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="peer">Peer Learning</TabsTrigger>
          <TabsTrigger value="training">Training Programs</TabsTrigger>
          <TabsTrigger value="community">User Community</TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Expert Knowledge Capture & Sharing
              </CardTitle>
              <CardDescription>
                Documented best practices and success stories from client implementations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Knowledge Articles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">342</div>
                      <p className="text-xs text-muted-foreground">Published articles</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Monthly Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8.2K</div>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4.7</div>
                      <p className="text-xs text-muted-foreground">Out of 5.0</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Contributors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">47</div>
                      <p className="text-xs text-muted-foreground">Active contributors</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Featured Knowledge Articles</h4>
                    <Button size="sm">Contribute Article</Button>
                  </div>
                  
                  {knowledgeBase.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{article.title}</h4>
                          <p className="text-sm text-muted-foreground">{article.source}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{article.type}</Badge>
                          <Badge>{article.category}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Views:</span>
                          <p className="text-muted-foreground">{article.views}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Rating:</span>
                          <div className="flex items-center gap-1 mt-1">
                            {getRatingStars(article.rating)}
                            <span className="text-xs ml-1">{article.rating}</span>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">Updated:</span>
                          <p className="text-muted-foreground">{article.lastUpdated}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm">Read Article</Button>
                        <Button variant="outline" size="sm">Share</Button>
                        <Button variant="outline" size="sm">Bookmark</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Peer Learning Programs
              </CardTitle>
              <CardDescription>
                Connect customers for knowledge sharing and collaborative learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active Programs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground">Running this quarter</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Participants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">156</div>
                      <p className="text-xs text-muted-foreground">Across all programs</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Satisfaction Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4.8</div>
                      <p className="text-xs text-muted-foreground">Out of 5.0</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Upcoming Programs</h4>
                    <Button size="sm">Create Program</Button>
                  </div>
                  
                  {peerLearningPrograms.map((program) => (
                    <div key={program.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{program.name}</h4>
                          <p className="text-sm text-muted-foreground">{program.type}</p>
                        </div>
                        <Badge>{program.participants} participants</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Next Session:</span>
                          <p className="text-muted-foreground">{program.nextSession}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Facilitator:</span>
                          <p className="text-muted-foreground">{program.facilitator}</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">Topics:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {program.topics.map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm">Join Program</Button>
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Invite Others</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Advanced Training & Certification Programs
              </CardTitle>
              <CardDescription>
                Structured learning paths for power users and administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active Programs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">Available certifications</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Enrolled Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">405</div>
                      <p className="text-xs text-muted-foreground">This quarter</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">91%</div>
                      <p className="text-xs text-muted-foreground">Average across programs</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Certified Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">289</div>
                      <p className="text-xs text-muted-foreground">Total certifications issued</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {trainingPrograms.map((program) => (
                    <div key={program.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{program.program}</h4>
                          <p className="text-sm text-muted-foreground">{program.level} Level</p>
                        </div>
                        <Badge className="bg-green-500">{program.completionRate}% completion</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Duration:</span>
                          <p className="text-muted-foreground">{program.duration}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Participants:</span>
                          <p className="text-muted-foreground">{program.participants}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Completion Rate:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={program.completionRate} className="h-2 flex-1" />
                            <span className="text-xs">{program.completionRate}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">Next Cohort:</span>
                          <p className="text-muted-foreground">{program.nextCohort}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm">Enroll Users</Button>
                        <Button variant="outline" size="sm">View Curriculum</Button>
                        <Button variant="outline" size="sm">Track Progress</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Community Management
              </CardTitle>
              <CardDescription>
                Foster collaboration and knowledge sharing across the user community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userCommunity.totalMembers}</div>
                      <p className="text-xs text-muted-foreground">Registered users</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userCommunity.activeMembers}</div>
                      <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Discussions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userCommunity.discussions}</div>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Questions Answered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userCommunity.questionsAnswered}</div>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userCommunity.averageResponseTime}</div>
                      <p className="text-xs text-muted-foreground">Average</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Recent Community Activity</h4>
                  
                  {[
                    {
                      type: "Question",
                      title: "Best practices for setting risk appetite thresholds?",
                      author: "Sarah M. - FirstNational Bank",
                      responses: 5,
                      timestamp: "2 hours ago"
                    },
                    {
                      type: "Discussion",
                      title: "Regulatory update Q3 2024 - Impact on reporting",
                      author: "Michael C. - Regional Bank Corp",
                      responses: 12,
                      timestamp: "4 hours ago"
                    },
                    {
                      type: "Best Practice",
                      title: "Automated incident escalation workflows", 
                      author: "Lisa R. - Community Credit Union",
                      responses: 8,
                      timestamp: "1 day ago"
                    }
                  ].map((activity, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{activity.title}</h5>
                          <p className="text-sm text-muted-foreground">{activity.author}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{activity.type}</Badge>
                          <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{activity.responses} responses</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View Discussion</Button>
                          <Button size="sm" variant="outline">Join Conversation</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeTransferCenter;
