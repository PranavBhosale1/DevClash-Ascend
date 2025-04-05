"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { BookOpen, Calendar, Clock, Plus, Video, ChevronDown, ChevronRight, BarChart, Activity, LineChart, TrendingUp, Trash2, AlertCircle, Loader2, Circle, CheckCircle2, Map } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RoadmapCreator } from "@/components/roadmap-creator"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

// Function to extract YouTube video ID from URL
const getYoutubeId = (url: string) => {
  if (!url) return "";
  
  try {
    // Try to handle all the different YouTube URL formats
    // For URLs like normal YouTube watch URLs
    const normalMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/user\/\S+\/\S+\/|youtube\.com\/user\/\S+\/|youtube\.com\/\S+\/\S+\/|youtube\.com\/\S+\/|youtube\.com\/[^\/]+\?.*v=|youtube\.com\/.+\/|youtube\.com\/(?:e|v|embed)\/|youtube\.com\/[^v]+v=|youtu\.be\/)([^"&?\/\s]{11})/);
    
    if (normalMatch && normalMatch[1]) {
      return normalMatch[1];
    }
    
    // For our specific case where we have "watch?v=0IAPZzGSbME&q=..." format
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
    }
    
    // Fallback to a default video ID if none found
    console.log("Could not extract YouTube ID from URL:", url);
    return "0IAPZzGSbME"; // Default video ID as seen in our data
  } catch (error) {
    console.error("Error extracting YouTube ID:", error);
    return "0IAPZzGSbME"; // Default fallback
  }
};

// MongoDB Roadmap interface
interface MongoRoadmap {
  _id: string;
  roadmapId: string;
  userId: string;
  supabaseUserId: string;
  title: string;
  description: string;
  topics: Topic[];
  progress?: number;
  completedVideos?: string[];
  createdAt: string;
  updatedAt: string;
  totalVideos: number;
  learningTime?: number;
}

// Topic interface from MongoDB
interface Topic {
  name: string;
  queries: string[];
  links: string[][];
  day: number;
  position: number;
  _id: string;
  completed?: boolean;
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [mongoRoadmaps, setMongoRoadmaps] = useState<MongoRoadmap[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [progressHistory, setProgressHistory] = useState<{date: string, count: number}[]>([])
  const [activeRoadmap, setActiveRoadmap] = useState<MongoRoadmap | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [weeklyProgress, setWeeklyProgress] = useState<{
    day: number; 
    label: string;
    date: string;
    total: number;
    completed: number;
    percentage: number;
    isToday: boolean;
  }[]>([])

  useEffect(() => {
    if (user) {
      fetchMongoRoadmaps()
    }
  }, [user])

  const fetchMongoRoadmaps = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Fetch roadmaps from MongoDB using the API
      const response = await fetch(`/api/roadmaps/user?supabaseUserId=${user.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('MongoDB API error:', errorData);
        toast.error("Failed to load roadmaps", {
          description: errorData.message || "There was an error loading your roadmaps from MongoDB"
        });
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.roadmaps) {
        console.log('Fetched roadmaps from MongoDB:', data.roadmaps);
        
        // Calculate progress for each roadmap
        const roadmapsWithProgress = data.roadmaps.map((roadmap: MongoRoadmap) => {
          // Calculate total videos in roadmap
          const totalVideos = roadmap.topics.reduce((total: number, topic: Topic) => {
            return total + topic.links.reduce((sum: number, linkGroup: string[]) => sum + linkGroup.length, 0);
          }, 0);
          
          // Get completed videos (default to empty array if not present)
          const completedVideos = roadmap.completedVideos || [];
          
          // Calculate progress percentage
          const progress = totalVideos > 0 ? Math.round((completedVideos.length / totalVideos) * 100) : 0;
          
          return {
            ...roadmap,
            progress,
            completedVideos: completedVideos,
            totalVideos: totalVideos
          };
        });
        
        setMongoRoadmaps(roadmapsWithProgress);
        
        // Set the first roadmap as active if available
        if (roadmapsWithProgress.length > 0) {
          setActiveRoadmap(roadmapsWithProgress[0]);
        }
      } else {
        console.error('Failed to fetch MongoDB roadmaps:', data.message);
      }
    } catch (error) {
      console.error('Error fetching MongoDB roadmaps:', error);
      toast.error("Failed to load roadmaps", {
        description: "There was an error connecting to MongoDB"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate progress history based on roadmaps data
  useEffect(() => {
    if (mongoRoadmaps.length > 0) {
      generateProgressHistory();
    }
  }, [mongoRoadmaps]);

  // Generate history data based on completedVideos timestamps (simulated for demo)
  const generateProgressHistory = () => {
    // For a real implementation, you'd store timestamps with completedVideos
    // Here we'll simulate it with random data for the last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    });

    // Calculate video count per day - in a real implementation, 
    // you would filter completedVideos by date
    const totalCompletedVideos = mongoRoadmaps.reduce((sum, roadmap) => 
      sum + (roadmap.completedVideos?.length || 0), 0);
    
    // Distribute videos across days - in real app, use actual completion dates
    let remainingVideos = totalCompletedVideos;
    const history = last7Days.map((date, index) => {
      // Distribute videos with increasing trend (more recent = more videos)
      // This is just for demo purposes
      const weight = (index + 1) * 1.5;
      const totalWeight = 28; // sum of weights (1.5 + 3 + 4.5 + 6 + 7.5 + 9 + 10.5)
      const videosForDay = Math.min(
        Math.round((weight / totalWeight) * totalCompletedVideos), 
        remainingVideos
      );
      remainingVideos -= videosForDay;
      
      return {
        date,
        count: videosForDay
      };
    });

    setProgressHistory(history);
  };

  // Calculate video counts for dashboard metrics
  const totalVideosCompleted = mongoRoadmaps.reduce((total, roadmap) => 
    total + (roadmap.completedVideos?.length || 0), 0);
  
  const totalAvailableVideos = mongoRoadmaps.reduce((total, roadmap) => 
    total + roadmap.topics.reduce((sum, topic) => 
      sum + topic.links.reduce((linkSum, linkGroup) => linkSum + linkGroup.length, 0), 0), 0);
  
  const totalCompletedTopics = mongoRoadmaps.reduce((total, roadmap) => 
    total + roadmap.topics.filter(topic => topic.completed).length, 0);
  
  const totalTopics = mongoRoadmaps.reduce((total, roadmap) => 
    total + roadmap.topics.length, 0);
  
  const overallProgress = totalAvailableVideos > 0 
    ? Math.round((totalVideosCompleted / totalAvailableVideos) * 100) 
    : 0;

  // Calculate daily and weekly metrics
  const todayVideos = progressHistory.length > 0 ? progressHistory[progressHistory.length - 1].count : 0;
  const weeklyVideos = progressHistory.reduce((sum, day) => sum + day.count, 0);
  const maxVideosPerDay = progressHistory.length > 0 
    ? Math.max(...progressHistory.map(d => d.count)) 
    : 0;

  // Calculate weekly progress when active roadmap changes
  useEffect(() => {
    if (!activeRoadmap) return;
    
    try {
      console.log("Calculating weekly progress for roadmap:", activeRoadmap.title);
      
      // Generate past 7 days dates
      const past7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          day: date.getDay(), // 0 = Sunday, 1 = Monday, etc.
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          jsDate: date
        };
      }).reverse(); // Reverse to show oldest first
      
      console.log("Past 7 days:", past7Days.map(d => `${d.label} (day ${d.day})`));
      
      const weekProgress = past7Days.map(dayInfo => {
        // Find topics for this day based on the day property
        const topicsForDay = activeRoadmap.topics.filter(topic => {
          const topicDay = topic.day % 7; // Handle day values > 7
          return topicDay === dayInfo.day; // Map 0 to Sunday
        });
        
        console.log(`Topics for ${dayInfo.label} (day ${dayInfo.day}):`, topicsForDay.length);
        
        // Calculate videos and completion for this day
        let totalVideos = 0;
        let completedVideos = 0;
        
        topicsForDay.forEach(topic => {
          if (topic.links && topic.links.length > 0 && topic.links[0]) {
            const videos = topic.links[0];
            totalVideos += videos.length;
            
            if (activeRoadmap.completedVideos && videos) {
              videos.forEach(url => {
                if (activeRoadmap.completedVideos?.includes(url)) {
                  completedVideos++;
                }
              });
            }
          }
        });
        
        const isToday = dayInfo.jsDate.toDateString() === new Date().toDateString();
        
        const percentage = totalVideos > 0 
          ? Math.round((completedVideos / totalVideos) * 100) 
          : 0;
        
        console.log(`Stats for ${dayInfo.label}: ${completedVideos}/${totalVideos} videos (${percentage}%)`);
        
        return {
          ...dayInfo,
          total: totalVideos,
          completed: completedVideos,
          percentage,
          isToday
        };
      });
      
      setWeeklyProgress(weekProgress);
    } catch (error) {
      console.error("Error calculating weekly progress:", error);
    }
  }, [activeRoadmap]);

  // Function to delete roadmap
  const deleteRoadmap = async () => {
    if (!user || !activeRoadmap) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/roadmaps/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roadmapId: activeRoadmap.roadmapId,
          supabaseUserId: user.id
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted roadmap from the list
        setMongoRoadmaps(prevRoadmaps => 
          prevRoadmaps.filter(r => r.roadmapId !== activeRoadmap.roadmapId)
        );
        
        // If there are remaining roadmaps, select the first one
        if (mongoRoadmaps.length > 1) {
          const remainingRoadmaps = mongoRoadmaps.filter(r => r.roadmapId !== activeRoadmap.roadmapId);
          setActiveRoadmap(remainingRoadmaps[0]);
        } else {
          setActiveRoadmap(null);
        }
      } else {
        console.error('Failed to delete roadmap:', data.message);
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full md:col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/create">Create New Roadmap</Link>
        </Button>
      </div>

      <Tabs defaultValue="roadmaps" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roadmaps">My Roadmaps</TabsTrigger>
        </TabsList>

        <TabsContent value="roadmaps">
          <div className="grid grid-cols-1 gap-6">
            {mongoRoadmaps.length > 0 ? (
              mongoRoadmaps.map((roadmap) => (
                <Card key={roadmap.roadmapId} className="w-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{roadmap.title}</CardTitle>
                        <CardDescription className="mt-1">{roadmap.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.floor((roadmap.learningTime || 0) / 3600)}h {Math.floor(((roadmap.learningTime || 0) % 3600) / 60)}m
                        </Badge>
                        <Badge variant="outline">
                          {roadmap.progress || 0}% Complete
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={roadmap.progress || 0} className="h-2" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                          <Video className="mr-2 h-4 w-4 opacity-70" />
                          <span>
                            {roadmap.completedVideos?.length || 0}/{roadmap.totalVideos} videos completed
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4 opacity-70" />
                          <span>
                            {roadmap.topics.filter(t => t.completed).length}/{roadmap.topics.length} topics completed
                          </span>
                        </div>
                        
                        {roadmap.createdAt && (
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 opacity-70" />
                            <span>
                              Created {new Date(roadmap.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Topics</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {roadmap.topics.slice(0, 4).map((topic, index) => (
                            <div 
                              key={`${roadmap.roadmapId}-topic-${topic._id || index}`} 
                              className="flex items-center p-2 rounded-md border"
                            >
                              {topic.completed ? (
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 mr-2 text-muted-foreground" />
                              )}
                              <span className="text-sm">{topic.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">Day {topic.day}</Badge>
                            </div>
                          ))}
                          {roadmap.topics.length > 4 && (
                            <div className="flex items-center justify-center p-2 rounded-md border border-dashed">
                              <span className="text-sm text-muted-foreground">
                                +{roadmap.topics.length - 4} more topics
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 justify-between">
                    <div className="flex gap-2">
                      <Button asChild variant="outline">
                        <Link href={`/dashboard/roadmap/${roadmap.roadmapId}`}>View Details</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={`/dashboard/roadmap/${roadmap.roadmapId}/visualization`}>
                          <Map className="mr-2 h-4 w-4" />
                          Visual Map
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="border-red-200 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center">
                              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                              Delete Roadmap
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{roadmap.title}"? This action cannot be undone.
                              All your progress and data associated with this roadmap will be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                setActiveRoadmap(roadmap);
                                deleteRoadmap();
                              }}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete Roadmap
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <Button asChild>
                      <Link href={`/dashboard/roadmap/${roadmap.roadmapId}`}>
                        Continue Learning
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card className="border-dashed md:col-span-3">
                <CardHeader>
                  <CardTitle>No Roadmaps Found</CardTitle>
                  <CardDescription>
                    You don't have any roadmaps yet. Create your first roadmap to start tracking your progress.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/dashboard/create">Create New Roadmap</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {mongoRoadmaps.length > 0 ? (
            <>
              {/* Roadmap selection and delete button */}
              <div className="mb-6 flex justify-between items-end">
                <div className="flex-1 max-w-md">
                  <Label htmlFor="roadmap-select" className="mb-2 block">Select Roadmap</Label>
                  <select 
                    id="roadmap-select"
                    className="w-full px-3 py-2 border rounded-md"
                    value={activeRoadmap?.roadmapId || ""}
                    onChange={(e) => {
                      const selected = mongoRoadmaps.find(r => r.roadmapId === e.target.value);
                      if (selected) setActiveRoadmap(selected);
                    }}
                  >
                    {mongoRoadmaps.map((roadmap) => (
                      <option key={roadmap.roadmapId} value={roadmap.roadmapId}>
                        {roadmap.title} ({roadmap.progress || 0}% complete)
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Delete roadmap button */}
                {activeRoadmap && (
                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="ml-4" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          Delete Roadmap
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{activeRoadmap.title}"? This action cannot be undone.
                          All your progress and data associated with this roadmap will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={deleteRoadmap}
                          className="bg-red-500 hover:bg-red-600"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Delete Roadmap'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              
              {activeRoadmap && (
                <>
                  {/* Overall progress card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{activeRoadmap.title}</CardTitle>
                      <CardDescription>{activeRoadmap.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Overall Progress</span>
                            <span>{activeRoadmap.progress || 0}%</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                (activeRoadmap.progress || 0) < 20 ? "bg-red-500" :
                                (activeRoadmap.progress || 0) < 50 ? "bg-yellow-500" :
                                (activeRoadmap.progress || 0) < 80 ? "bg-blue-500" : 
                                "bg-green-500"
                              )}
                              style={{ width: `${activeRoadmap.progress || 0}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {activeRoadmap.completedVideos?.length || 0} of {activeRoadmap.totalVideos} videos completed
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/dashboard/roadmap/${activeRoadmap.roadmapId}`}>
                          Continue Learning
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Weekly Progress Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Progress</CardTitle>
                      <CardDescription>
                        Your progress over the last 7 days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Today's progress highlight */}
                      {weeklyProgress.find(day => day.isToday) && (
                        <div className="mb-6 bg-muted/30 p-4 rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Today's Progress</h4>
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              {(() => {
                                const today = weeklyProgress.find(day => day.isToday);
                                if (!today) return "0%";
                                return `${today.percentage}%`;
                              })()}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <Progress 
                              value={(() => {
                                const today = weeklyProgress.find(day => day.isToday);
                                if (!today) return 0;
                                return today.percentage;
                              })()} 
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                {(() => {
                                  const today = weeklyProgress.find(day => day.isToday);
                                  if (!today) return "0/0 videos";
                                  return `${today.completed}/${today.total} videos completed`;
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Weekly chart */}
                      <div className="grid grid-cols-7 gap-2 h-44 items-end pt-6">
                        {weeklyProgress.map((day, index) => (
                          <div key={index} className="flex flex-col h-full">
                            {/* Day header */}
                            <div className="text-center mb-1">
                              <span className={cn(
                                "text-xs block font-medium",
                                day.isToday ? "text-primary" : ""
                              )}>
                                {day.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {day.date}
                              </span>
                            </div>
                            
                            {/* Progress bar column */}
                            <div className="flex-1 flex flex-col justify-end w-full relative">
                              <div 
                                className={cn(
                                  "w-full rounded-t-md transition-all duration-500",
                                  day.percentage === 0 ? "h-1 bg-muted-foreground/20" :
                                  day.isToday ? "bg-primary" : 
                                  day.percentage === 100 ? "bg-green-500" :
                                  "bg-blue-500"
                                )}
                                style={{ height: `${Math.max(day.percentage, 2)}%` }}
                              ></div>
                              
                              {/* Video counter at bottom of each bar */}
                              <div className="absolute bottom-0 transform translate-y-full pt-2 left-0 right-0 text-center">
                                <span className={cn(
                                  "text-xs font-medium",
                                  day.isToday ? "text-primary" : ""
                                )}>
                                  {day.completed}/{day.total}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Detailed Weekly Summary Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Summary</CardTitle>
                      <CardDescription>
                        Daily breakdown of your learning activity
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {weeklyProgress.map((day, index) => (
                          <div key={index} className={cn(
                            "p-3 rounded-lg border",
                            day.isToday ? "bg-primary/5 border-primary/20" : ""
                          )}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <h3 className="font-medium">
                                  {day.label} ({day.date})
                                  {day.isToday && <span className="ml-2 text-xs text-primary font-medium">Today</span>}
                                </h3>
                              </div>
                              <Badge variant={day.completed > 0 ? "outline" : "secondary"} className="text-xs">
                                {day.completed} / {day.total} videos
                              </Badge>
                            </div>
                            
                            <Progress 
                              value={day.percentage} 
                              className="h-1.5"
                            />
                            
                            {day.total > 0 ? (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Video className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                                  <span>
                                    {day.total} videos assigned
                                  </span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <CheckCircle2 className={cn(
                                    "h-3.5 w-3.5 mr-1.5",
                                    day.completed === day.total && day.total > 0 ? "text-green-500" : "text-muted-foreground"
                                  )} />
                                  <span>
                                    {day.completed} videos completed
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2 text-xs text-muted-foreground">
                                No videos scheduled for this day
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          ) : (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No Roadmaps Found</CardTitle>
                <CardDescription>
                  You don't have any roadmaps yet. Create your first roadmap to start tracking your progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/dashboard/create">Create New Roadmap</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
