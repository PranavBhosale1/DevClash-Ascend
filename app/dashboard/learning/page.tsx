"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Circle, CheckCircle2, ChevronDown, Loader2, Trash2, AlertCircle } from "lucide-react"
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

// Define interface for MongoDB roadmap data
interface MongoRoadmap {
  _id: string;
  roadmapId: string;
  title: string;
  description: string;
  topics: Topic[];
  completedVideos: string[];
  progress: number;
  totalVideos: number;
}

interface Topic {
  _id: string;
  name: string;
  queries: string[];
  links: string[][];
  day: number;
  position: number;
  completed: boolean;
}

// Supabase Roadmap interface for legacy support
interface SupabaseRoadmap {
  id: string
  title: string
  learning_goal: string
  experience_level: string
  time_commitment: number
  created_at: string
}

interface LearningResource {
  id: string
  title: string
  description: string
  resource_type: string
  url: string
  content: string
  difficulty_level: string
  estimated_time: number
}

interface JoinedResourceData {
  position: number;
  learning_resources: {
    id: string;
    title: string;
    description: string;
    resource_type: string;
    url: string | null;
    content: string | null;
    difficulty_level: string;
    estimated_time: number;
  };
}

// Mock data for demonstration
const mockModules = [
  {
    id: 1,
    title: "Introduction to the Topic",
    lessons: [
      { id: 1, title: "Overview and Fundamentals", completed: true },
      {
        id: 2, 
        title: "Core Concepts and Terminology", 
        completed: true 
      },
      { 
        id: 3, 
        title: "Setting Up Your Environment", 
        completed: false 
      }
    ]
  },
  {
    id: 2,
    title: "Building Your First Project",
    lessons: [
      { id: 4, title: "Project Structure and Setup", completed: false },
      { id: 5, title: "Implementing Core Features", completed: false },
      { id: 6, title: "Testing and Debugging", completed: false }
    ]
  },
  {
    id: 3,
    title: "Advanced Techniques",
    lessons: [
      { id: 7, title: "Performance Optimization", completed: false },
      { id: 8, title: "Best Practices and Patterns", completed: false },
      { id: 9, title: "Real-world Applications", completed: false }
    ]
  }
];

export default function LearningPage() {
  // State variables
  const [roadmaps, setRoadmaps] = useState<MongoRoadmap[]>([]);
  const [currentRoadmap, setCurrentRoadmap] = useState<MongoRoadmap | null>(null);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set([0]));
  const [isLoading, setIsLoading] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);
  const [markingProgress, setMarkingProgress] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [todaysVideos, setTodaysVideos] = useState<{topic: Topic, urls: string[]}[]>([]);
  const [dailyProgress, setDailyProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0
  });
  const [weeklyProgress, setWeeklyProgress] = useState<{
    day: number; 
    label: string;
    date: string;
    total: number;
    completed: number;
    percentage: number;
  }[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Set current date on component mount
  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(today.toLocaleDateString('en-US', options));
  }, []);

  // Calculate past 7 days progress data
  useEffect(() => {
    if (!currentRoadmap) return;
    
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
    
    const weekProgress = past7Days.map(dayInfo => {
      // For testing/demo purpose - hard coding some data to demonstrate graph
      // Replace this with real data calculation in production
      const mockData: Record<number, { total: number; completed: number }> = {
        1: { total: 17, completed: 15 }, // Monday
        2: { total: 12, completed: 8 },  // Tuesday
        3: { total: 8, completed: 3 },   // Wednesday 
        4: { total: 14, completed: 10 }, // Thursday
        5: { total: 10, completed: 5 },  // Friday
        6: { total: 5, completed: 2 },   // Saturday
        0: { total: 6, completed: 0 },   // Sunday
      };
      
      // Find topics for this day based on the day property
      const topicsForDay = currentRoadmap.topics.filter(topic => {
        const topicDay = topic.day % 7; // Handle day values > 7
        const mappedDay = topicDay === 0 ? 0 : topicDay;
        return mappedDay === dayInfo.day;
      });
      
      // This is the calculation based on your real data
      let totalVideos = 0;
      let completedVideos = 0;
      
      topicsForDay.forEach(topic => {
        if (topic.links && topic.links.length > 0 && topic.links[0]) {
          const videos = topic.links[0];
          totalVideos += videos.length;
          
          if (currentRoadmap.completedVideos) {
            videos.forEach(url => {
              if (currentRoadmap.completedVideos.includes(url)) {
                completedVideos++;
              }
            });
          }
        }
      });

      // Use mock data if available, otherwise use calculated data
      const mockDataForDay = mockData[dayInfo.day];
      if (mockDataForDay) {
        totalVideos = mockDataForDay.total || totalVideos;
        completedVideos = mockDataForDay.completed || completedVideos;
      }
      
      const percentage = totalVideos > 0 
        ? Math.round((completedVideos / totalVideos) * 100) 
        : 0;
      
      return {
        ...dayInfo,
        total: totalVideos,
        completed: completedVideos,
        percentage
      };
    });
    
    setWeeklyProgress(weekProgress);
    
    // Today's progress (current day)
    const today = new Date().getDay(); // 0 is Sunday in JavaScript
    const todayProgress = weekProgress.find(day => day.day === today);
    
    if (todayProgress) {
      setDailyProgress({
        completed: todayProgress.completed,
        total: todayProgress.total,
        percentage: todayProgress.percentage
      });
    }
    
  }, [currentRoadmap]);

  // Identify today's videos when roadmap changes
  useEffect(() => {
    if (!currentRoadmap) return;
    
    // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
    const today = new Date().getDay();
    
    // Find topics scheduled for today based on their day property
    const topicsForToday = currentRoadmap.topics.filter(topic => {
      // Map topic.day to JavaScript day (0 = Sunday, 1-6 = Monday-Saturday)
      const topicDay = topic.day % 7;
      // If day is 1-7, map 7 to 0 (Sunday)
      const mappedDay = topicDay === 0 ? 0 : topicDay;
      return mappedDay === today;
    });
    
    // Collect videos from these topics
    const videos = topicsForToday.map(topic => ({
      topic,
      urls: topic.links && topic.links.length > 0 ? topic.links[0] : []
    }));
    
    setTodaysVideos(videos);
  }, [currentRoadmap]);

  // Fetch roadmaps when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClientComponentClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          fetchUserRoadmaps(user.id);
        } else {
          console.error('No user found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Fetch a specific roadmap if ID is provided in the URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const roadmapId = params.get('id');
    
    if (roadmapId && user && roadmaps.length > 0) {
      // Check if we already have this roadmap in our list
      const foundRoadmap = roadmaps.find(r => r.roadmapId === roadmapId);
      
      if (foundRoadmap) {
        setCurrentRoadmap(foundRoadmap);
      } else {
        // Fetch the specific roadmap if not in our list
        fetchRoadmapById(roadmapId, user.id);
      }
    }
  }, [roadmaps, user]);

  // Function to fetch user roadmaps from MongoDB
  const fetchUserRoadmaps = async (supabaseUserId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/roadmaps/user?supabaseUserId=${supabaseUserId}`);
      const data = await response.json();
      
      if (data.success && data.roadmaps) {
        console.log('Fetched roadmaps:', data.roadmaps);
        setRoadmaps(data.roadmaps);
        
        // If there are roadmaps and none is currently selected, select the first one
        if (data.roadmaps.length > 0 && !currentRoadmap) {
          setCurrentRoadmap(data.roadmaps[0]);
        }
      } else {
        console.error('Failed to fetch roadmaps:', data.message);
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch a specific roadmap by ID
  const fetchRoadmapById = async (roadmapId: string, supabaseUserId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/roadmaps/get?id=${roadmapId}&supabaseUserId=${supabaseUserId}`);
      const data = await response.json();
      
      if (data.success && data.roadmap) {
        console.log('Fetched roadmap by ID:', data.roadmap);
        setCurrentRoadmap(data.roadmap);
      } else {
        console.error('Failed to fetch roadmap by ID:', data.message);
      }
    } catch (error) {
      console.error('Error fetching roadmap by ID:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to mark a video as completed
  const markVideoAsCompleted = async (videoUrl: string, topicId: string) => {
    if (!user || !currentRoadmap) return;
    
    try {
      setMarkingProgress(true);
      
      const response = await fetch('/api/roadmaps/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roadmapId: currentRoadmap.roadmapId,
          supabaseUserId: user.id,
          videoUrl,
          topicId
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.roadmap) {
        console.log('Progress updated:', data.roadmap);
        setCurrentRoadmap(data.roadmap);
        
        // Update roadmaps list with the updated roadmap
        setRoadmaps(prevRoadmaps => 
          prevRoadmaps.map(r => 
            r.roadmapId === currentRoadmap.roadmapId ? data.roadmap : r
          )
        );
      } else {
        console.error('Failed to update progress:', data.message);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setMarkingProgress(false);
    }
  };

  // Function to handle topic click and toggle expansion
  const handleTopicClick = (index: number) => {
    const newExpandedTopics = new Set(expandedTopics);
    
    if (newExpandedTopics.has(index)) {
      newExpandedTopics.delete(index);
    } else {
      newExpandedTopics.add(index);
    }
    
    setExpandedTopics(newExpandedTopics);
    setActiveTopicIndex(index);
    setVideoIndex(0); // Reset to first video when switching topics
  };

  // Function to handle next video
  const handleNextVideo = () => {
    if (!currentRoadmap) return;
    
    const currentTopic = currentRoadmap.topics[activeTopicIndex];
    if (!currentTopic) return;
    
    const currentLinks = currentTopic.links;
    if (!currentLinks || currentLinks.length === 0) return;
    
    const currentLinkGroup = currentLinks[0];
    if (!currentLinkGroup || videoIndex >= currentLinkGroup.length - 1) {
      // We're at the last video for this topic
      const videoUrl = currentLinkGroup[videoIndex];
      markVideoAsCompleted(videoUrl, currentTopic._id);
      
      // Move to next topic if available
      if (activeTopicIndex < currentRoadmap.topics.length - 1) {
        const newIndex = activeTopicIndex + 1;
        setActiveTopicIndex(newIndex);
        setExpandedTopics(new Set([newIndex]));
        setVideoIndex(0);
      }
    } else {
      // Mark current video as completed
      const videoUrl = currentLinkGroup[videoIndex];
      markVideoAsCompleted(videoUrl, currentTopic._id);
      
      // Move to next video
      setVideoIndex(videoIndex + 1);
    }
  };

  // Function to check if a video is completed
  const isVideoCompleted = (videoUrl: string) => {
    if (!currentRoadmap || !currentRoadmap.completedVideos) return false;
    return currentRoadmap.completedVideos.includes(videoUrl);
  };

  // Get the current video URL
  const getCurrentVideoUrl = () => {
    if (!currentRoadmap || !currentRoadmap.topics[activeTopicIndex]) return null;
    
    const currentTopic = currentRoadmap.topics[activeTopicIndex];
    if (!currentTopic.links || currentTopic.links.length === 0) return null;
    
    const videoLinks = currentTopic.links[0];
    if (!videoLinks || videoLinks.length === 0 || videoIndex >= videoLinks.length) return null;
    
    return videoLinks[videoIndex];
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    
    return match ? match[1] : null;
  };

  // Function to delete roadmap
  const deleteRoadmap = async () => {
    if (!user || !currentRoadmap) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/roadmaps/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roadmapId: currentRoadmap.roadmapId,
          supabaseUserId: user.id
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted roadmap from the list
        setRoadmaps(prevRoadmaps => 
          prevRoadmaps.filter(r => r.roadmapId !== currentRoadmap.roadmapId)
        );
        
        // If there are remaining roadmaps, select the first one
        if (roadmaps.length > 1) {
          const remainingRoadmaps = roadmaps.filter(r => r.roadmapId !== currentRoadmap.roadmapId);
          setCurrentRoadmap(remainingRoadmaps[0]);
        } else {
          setCurrentRoadmap(null);
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

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="container mx-auto py-10">
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  // Render no roadmaps message
  if (roadmaps.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="container mx-auto py-10">
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <h2 className="text-xl font-semibold">No Roadmaps Found</h2>
            <p>You don't have any roadmaps yet. Create one to get started!</p>
          </div>
        </div>
      </div>
    );
  }

  // Render the learning page
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto py-10">
        {/* Header with date */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Learning Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            {currentDate}
          </div>
        </div>

        {/* Roadmap selection */}
        <div className="mb-6 flex justify-between items-end">
          <div className="flex-1">
            <Label htmlFor="roadmap-select">Select Roadmap</Label>
            <Select
              value={currentRoadmap?.roadmapId || ""}
              onValueChange={(value) => {
                const selected = roadmaps.find(r => r.roadmapId === value);
                if (selected) {
                  setCurrentRoadmap(selected);
                  setActiveTopicIndex(0);
                  setExpandedTopics(new Set([0]));
                  setVideoIndex(0);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a roadmap" />
              </SelectTrigger>
              <SelectContent>
                {roadmaps.map((roadmap) => (
                  <SelectItem key={roadmap.roadmapId} value={roadmap.roadmapId}>
                    {roadmap.title} ({roadmap.progress}% complete)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Delete roadmap button */}
          {currentRoadmap && (
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
                    Are you sure you want to delete "{currentRoadmap.title}"? This action cannot be undone.
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

        {currentRoadmap && (
          <>
            {/* Progress summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Overall progress */}
              <div className="p-4 border rounded-lg shadow-sm bg-card">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Overall Progress</h3>
                <div className="flex flex-col">
                  <div>
                    <h2 className="text-xl font-semibold">{currentRoadmap.title}</h2>
                    <p className="text-muted-foreground text-sm">{currentRoadmap.description}</p>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden mb-1">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          currentRoadmap.progress < 20 ? "bg-red-500" :
                          currentRoadmap.progress < 50 ? "bg-yellow-500" :
                          currentRoadmap.progress < 80 ? "bg-blue-500" : 
                          "bg-green-500"
                        )}
                        style={{ width: `${currentRoadmap.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{currentRoadmap.progress}% complete</span>
                      <span>{currentRoadmap.completedVideos?.length || 0}/{currentRoadmap.totalVideos} videos</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Today's progress */}
              <div className="p-4 border rounded-lg shadow-sm bg-card">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Today's Progress</h3>
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })} Learning
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {dailyProgress.total > 0 
                      ? `${dailyProgress.completed} of ${dailyProgress.total} videos completed today` 
                      : "No videos scheduled for today"}
                  </p>
                  <div className="mt-3">
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden mb-1">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-blue-500"
                        style={{ width: `${dailyProgress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{dailyProgress.percentage}% complete today</span>
                      <span>{dailyProgress.completed}/{dailyProgress.total} videos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Weekly Progress Chart */}
            <div className="mb-6 p-4 border rounded-lg shadow-sm bg-card">
              <h2 className="text-xl font-semibold mb-4">Weekly Progress</h2>
              <div className="grid grid-cols-7 gap-2 h-52 items-end pt-6">
                {weeklyProgress.map((day, index) => (
                  <div key={index} className="flex flex-col h-full">
                    {/* Day header */}
                    <div className="text-center mb-1">
                      <span className={cn(
                        "text-xs block font-medium",
                        day.day === new Date().getDay() ? "text-primary" : ""
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
                          day.day === new Date().getDay() ? "bg-primary" : 
                          day.percentage === 100 ? "bg-green-500" :
                          "bg-blue-500"
                        )}
                        style={{ height: `${Math.max(day.percentage, 2)}%` }}
                      ></div>
                      
                      {/* Video counter at bottom of each bar */}
                      <div className="absolute bottom-0 transform translate-y-full pt-2 left-0 right-0 text-center">
                        <span className="text-xs font-medium">
                          {day.completed}/{day.total}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Today's Learning Section */}
            <div className="mb-6 p-4 border rounded-lg shadow-sm bg-card">
              <h2 className="text-xl font-semibold mb-3">Today's Learning Activities</h2>
              {todaysVideos.length > 0 ? (
                <div className="space-y-4">
                  {todaysVideos.map((item, idx) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-md">
                      <h3 className="font-medium mb-2">{item.topic.name}</h3>
                      <div className="space-y-2">
                        {item.urls.map((url, vidIdx) => {
                          const completed = isVideoCompleted(url);
                          return (
                            <div 
                              key={vidIdx} 
                              className={cn(
                                "flex items-center justify-between cursor-pointer p-2 rounded-md",
                                completed ? "text-muted-foreground" : "hover:bg-primary/5"
                              )}
                              onClick={() => {
                                setActiveTopicIndex(currentRoadmap.topics.findIndex(t => t._id === item.topic._id));
                                setVideoIndex(vidIdx);
                                setExpandedTopics(new Set([currentRoadmap.topics.findIndex(t => t._id === item.topic._id)]));
                              }}
                            >
                              <div className="flex items-center">
                                {completed ? (
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                                ) : (
                                  <Circle className="h-4 w-4 mr-2" />
                                )}
                                <span className={cn(completed ? "line-through" : "")}>
                                  Video {vidIdx + 1}
                                </span>
                              </div>
                              <div>
                                {!completed && (
                                  <Badge variant="outline">Current</Badge>
                                )}
                                {completed && (
                                  <span className="text-xs text-muted-foreground">Completed</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {item.urls.every(url => isVideoCompleted(url)) && (
                        <div className="mt-2 text-sm text-green-600 flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          <span>All videos completed!</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">No videos scheduled for today</p>
                  <p className="text-sm text-muted-foreground mt-1">Take a break or continue with other topics!</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Topics list */}
              <div className="col-span-1 space-y-4">
                <h2 className="text-xl font-bold mb-4">All Topics</h2>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      currentRoadmap.progress < 20 ? "bg-red-500" :
                      currentRoadmap.progress < 50 ? "bg-yellow-500" :
                      currentRoadmap.progress < 80 ? "bg-blue-500" : 
                      "bg-green-500"
                    )}
                    style={{ width: `${currentRoadmap.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentRoadmap.progress}% Complete
                </p>
                <div  className="space-y-2">
                  {currentRoadmap.topics.map((topic, index) => (
                    <div key={topic._id} className="space-y-2">
                      <div
                        className={cn(
                          "flex items-center justify-between p-3 rounded-md cursor-pointer",
                          activeTopicIndex === index
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-secondary",
                          // Highlight topics scheduled for today
                          todaysVideos.some(v => v.topic._id === topic._id) ? "border-l-2 border-blue-500" : ""
                        )}
                        onClick={() => handleTopicClick(index)}
                      >
                        <div className="flex items-center space-x-2">
                          {topic.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                          <span className="font-medium">{topic.name}</span>
                          {/* Show day indicator */}
                          <Badge variant="outline" className="ml-1">Day {topic.day}</Badge>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 transition-transform",
                            expandedTopics.has(index) ? "transform rotate-180" : ""
                          )}
                        />
                      </div>
                      {expandedTopics.has(index) && topic.links && topic.links.length > 0 && (
                        <div className="ml-7 space-y-2">
                          {topic.links[0].map((videoUrl, vIndex) => {
                            const isCompleted = isVideoCompleted(videoUrl);
                            const isCurrent = index === activeTopicIndex && vIndex === videoIndex;
                            
                            return (
                              <div
                                key={vIndex}
                                className={cn(
                                  "flex items-center space-x-2 p-2 rounded-md cursor-pointer",
                                  isCurrent ? "bg-primary/5" : "hover:bg-secondary/50",
                                  isCompleted ? "text-primary" : ""
                                )}
                                onClick={() => {
                                  setActiveTopicIndex(index);
                                  setVideoIndex(vIndex);
                                }}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                                <span className={cn(isCompleted ? "line-through text-muted-foreground" : "")}>
                                  Video {vIndex + 1}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content area */}
              <div className="col-span-1 md:col-span-3 space-y-6">
                {currentRoadmap.topics.length > 0 && activeTopicIndex < currentRoadmap.topics.length && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="text-2xl font-bold">
                          {currentRoadmap.topics[activeTopicIndex].name}
                        </h2>
                        <Badge variant="outline">Day {currentRoadmap.topics[activeTopicIndex].day}</Badge>
                      </div>
                      <div className="text-muted-foreground mb-4">
                        {currentRoadmap.topics[activeTopicIndex].queries.map((query, index) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-2">
                            {query}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Video player */}
                    <div className="space-y-4">
                      <div className="aspect-video rounded-lg overflow-hidden border bg-card">
                        {getCurrentVideoUrl() ? (
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(getCurrentVideoUrl() || '')}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p>No video available for this topic.</p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between">
                        <div>
                          {videoIndex > 0 && (
                            <Button 
                              variant="outline"
                              onClick={() => {
                                if (videoIndex > 0) {
                                  setVideoIndex(videoIndex - 1);
                                }
                              }}
                              disabled={markingProgress}
                            >
                              Previous Video
                            </Button>
                          )}
                        </div>
                        <Button 
                          onClick={handleNextVideo}
                          disabled={markingProgress}
                        >
                          {markingProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Next Video
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
