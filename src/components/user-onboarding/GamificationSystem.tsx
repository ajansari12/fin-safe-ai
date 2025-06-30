
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Award, 
  Target,
  TrendingUp,
  Users,
  BookOpen,
  Share,
  Crown,
  Zap,
  Gift
} from "lucide-react";

const GamificationSystem = () => {
  const userAchievements = {
    totalPoints: 2847,
    level: 12,
    nextLevelPoints: 3200,
    badges: 18,
    streak: 7,
    rank: "Risk Assessment Expert"
  };

  const badges = [
    {
      id: 1,
      name: "Quick Learner",
      description: "Complete 5 training modules in one week",
      icon: "⚡",
      earned: true,
      earnedDate: "2024-06-15",
      rarity: "Common",
      points: 100
    },
    {
      id: 2,
      name: "Risk Master",
      description: "Complete advanced risk assessment certification",
      icon: "🎯",
      earned: true,
      earnedDate: "2024-06-20",
      rarity: "Rare",
      points: 500
    },
    {
      id: 3,
      name: "Collaboration Champion",
      description: "Help 10 colleagues through mentoring",
      icon: "🤝",
      earned: false,
      progress: 7,
      total: 10,
      rarity: "Epic",
      points: 750
    },
    {
      id: 4,
      name: "Data Detective",
      description: "Discover and report 3 data quality issues",
      icon: "🔍",
      earned: false,
      progress: 1,
      total: 3,
      rarity: "Uncommon",
      points: 300
    }
  ];

  const leaderboards = [
    {
      category: "Overall Points",
      users: [
        { rank: 1, name: "Sarah Chen", points: 4250, department: "Risk Management", avatar: "SC" },
        { rank: 2, name: "Mike Rodriguez", points: 3890, department: "Compliance", avatar: "MR" },
        { rank: 3, name: "Emily Davis", points: 3654, department: "Operations", avatar: "ED" },
        { rank: 4, name: "You", points: 2847, department: "Risk Management", avatar: "YU", highlight: true },
        { rank: 5, name: "James Wilson", points: 2756, department: "Audit", avatar: "JW" }
      ]
    }
  ];

  const learningPaths = [
    {
      id: 1,
      title: "Risk Assessment Mastery",
      progress: 75,
      totalModules: 12,
      completedModules: 9,
      points: 1200,
      badge: "Risk Expert",
      difficulty: "Advanced",
      estimatedTime: "3 weeks"
    },
    {
      id: 2,
      title: "Compliance Professional",
      progress: 40,
      totalModules: 15,
      completedModules: 6,
      points: 1500,
      badge: "Compliance Pro",
      difficulty: "Intermediate",
      estimatedTime: "4 weeks"
    },
    {
      id: 3,
      title: "Data Analytics Specialist",
      progress: 0,
      totalModules: 10,
      completedModules: 0,
      points: 1000,
      badge: "Data Wizard",
      difficulty: "Advanced",
      estimatedTime: "5 weeks"
    }
  ];

  const challenges = [
    {
      id: 1,
      title: "7-Day Learning Streak",
      description: "Complete at least one learning activity for 7 consecutive days",
      progress: 7,
      total: 7,
      status: "completed",
      points: 200,
      deadline: "2024-07-15"
    },
    {
      id: 2,
      title: "Feature Explorer",
      description: "Try 5 different platform features this month",
      progress: 3,
      total: 5,
      status: "active",
      points: 150,
      deadline: "2024-07-31"
    },
    {
      id: 3,
      title: "Knowledge Sharer",
      description: "Share 3 best practices in the community forum",
      progress: 1,
      total: 3,
      status: "active",
      points: 300,
      deadline: "2024-07-20"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common": return "text-gray-600";
      case "Uncommon": return "text-green-600";
      case "Rare": return "text-blue-600";
      case "Epic": return "text-purple-600";
      case "Legendary": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "active": return <Target className="h-4 w-4 text-blue-500" />;
      case "locked": return <Award className="h-4 w-4 text-gray-400" />;
      default: return <Star className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          <TabsTrigger value="learning">Learning Paths</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-2">{userAchievements.totalPoints}</div>
                  <p className="text-muted-foreground">Total Points</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Level {userAchievements.level}</span>
                    <span className="text-sm font-medium">Level {userAchievements.level + 1}</span>
                  </div>
                  <Progress 
                    value={(userAchievements.totalPoints / userAchievements.nextLevelPoints) * 100} 
                    className="w-full" 
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {userAchievements.nextLevelPoints - userAchievements.totalPoints} points to next level
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-500">{userAchievements.badges}</div>
                    <div className="text-xs text-muted-foreground">Badges Earned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">{userAchievements.streak}</div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                </div>

                <div className="text-center">
                  <Badge className="bg-purple-500">{userAchievements.rank}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Badges & Achievements
                </CardTitle>
                <CardDescription>
                  Earn badges by completing challenges and mastering platform features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {badges.map((badge) => (
                    <div key={badge.id} className={`border rounded-lg p-4 ${badge.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{badge.icon}</div>
                          <div>
                            <h4 className="font-medium">{badge.name}</h4>
                            <p className={`text-xs ${getRarityColor(badge.rarity)}`}>{badge.rarity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{badge.points}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                      
                      {badge.earned ? (
                        <div className="flex items-center justify-between">
                          <Badge className="bg-green-500">Earned</Badge>
                          <span className="text-xs text-muted-foreground">{badge.earnedDate}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{badge.progress}/{badge.total}</span>
                          </div>
                          <Progress value={(badge.progress / badge.total) * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Leaderboards
              </CardTitle>
              <CardDescription>
                See how you rank against your peers in learning and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {leaderboards.map((board, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-medium mb-4">{board.category}</h3>
                    <div className="space-y-2">
                      {board.users.map((user) => (
                        <div key={user.rank} className={`flex items-center justify-between p-3 rounded-lg ${user.highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                              user.rank === 2 ? 'bg-gray-100 text-gray-800' :
                              user.rank === 3 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.rank <= 3 ? (
                                user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'
                              ) : (
                                user.rank
                              )}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                              {user.avatar}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{user.points.toLocaleString()} pts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    View Department Rankings
                  </Button>
                  <Button variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share Achievement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Paths & Certifications
              </CardTitle>
              <CardDescription>
                Structured learning journeys with rewards and recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningPaths.map((path) => (
                  <div key={path.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{path.title}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{path.difficulty}</Badge>
                          <Badge variant="secondary">{path.estimatedTime}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Gift className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{path.points} pts</span>
                        </div>
                        <p className="text-sm text-muted-foreground">+ {path.badge} badge</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{path.completedModules}/{path.totalModules} modules</span>
                      </div>
                      <Progress value={path.progress} className="h-2" />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant={path.progress > 0 ? "default" : "outline"}>
                        {path.progress > 0 ? "Continue" : "Start"} Learning Path
                      </Button>
                      <Button variant="outline" size="sm">View Curriculum</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Active Challenges
              </CardTitle>
              <CardDescription>
                Time-limited challenges to boost engagement and learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(challenge.status)}
                        <div>
                          <h4 className="font-medium">{challenge.title}</h4>
                          <p className="text-sm text-muted-foreground">Deadline: {challenge.deadline}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{challenge.points} pts</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    
                    {challenge.status !== "completed" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{challenge.progress}/{challenge.total}</span>
                        </div>
                        <Progress value={(challenge.progress / challenge.total) * 100} className="h-2" />
                      </div>
                    )}
                    
                    {challenge.status === "completed" && (
                      <Badge className="bg-green-500">Challenge Completed! 🎉</Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">🎯 Weekly Challenge</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete any 3 learning activities this week for bonus points!
                </p>
                <div className="flex justify-between items-center">
                  <Progress value={66} className="flex-1 mr-4" />
                  <span className="text-sm font-medium">2/3 complete</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationSystem;
