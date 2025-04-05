"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  CheckCircle2, 
  Circle, 
  Lock, 
  Unlock, 
  ChevronRight, 
  ArrowRight, 
  Star, 
  Trophy,
  Map,
  Move,
  Calendar,
  Layers as LayersIcon,
  BookOpen,
  Video
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"


interface Topic {
  _id: string
  name: string
  queries: string[]
  links: string[][]
  day: number
  position: number
  completed: boolean
}

interface Roadmap {
  _id: string
  roadmapId: string
  title: string
  description: string
  topics: Topic[]
  completedVideos: string[]
  progress: number
  totalVideos: number
  learningTime?: number
}

export default function RoadmapVisualizationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [learningTime, setLastSavedTime] = useState(0)
  const [lastSavedTime, setLearningTime] = useState(0)
  const [viewMode, setViewMode] = useState<'day' | 'category'>('day')
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dragStartPos = useRef({ x: 0, y: 0, scrollX: 0, scrollY: 0 })
  
  // Fetch roadmap data
  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!user || !params.id) return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/roadmaps/get?roadmapId=${params.id}&supabaseUserId=${user.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch roadmap')
        }
        
        const data = await response.json()
        
        if (data.success && data.roadmap) {
          // Sort topics by day and position
          const sortedTopics = [...data.roadmap.topics].sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day
            return a.position - b.position
          })
          
          setRoadmap({...data.roadmap, topics: sortedTopics})
          
          // Set the first incomplete topic as active
          const firstIncompleteTopic = sortedTopics.find(topic => !topic.completed)
          if (firstIncompleteTopic) {
            setActiveTopic(firstIncompleteTopic)
          } else {
            setActiveTopic(sortedTopics[0])
          }
        } else {
          throw new Error(data.message || 'Failed to fetch roadmap')
        }
      } catch (error) {
        toast.error('Error loading roadmap visualization')
        console.error('Error fetching roadmap:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRoadmap()
  }, [params.id, user])
  
  // Save learning time periodically
  useEffect(() => {
    const saveInterval = setInterval(async () => {
      if (learningTime > lastSavedTime && user && params.id) {
        try {
          const response = await fetch('/api/roadmaps/update-time', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              roadmapId: params.id,
              supabaseUserId: user.id,
              learningTime: learningTime - lastSavedTime,
            }),
          })
          
          if (response.ok) {
            setLastSavedTime(learningTime)
          }
        } catch (error) {
          console.error('Error saving learning time:', error)
        }
      }
    }, 60000) // Save every minute
    
    return () => clearInterval(saveInterval)
  }, [learningTime, lastSavedTime, user, params.id])
  
  // Handle topic click
  const handleTopicClick = (topic: Topic) => {
    setActiveTopic(topic)
  }
  
  // Navigate to learning page for the active topic
  const navigateToLearning = () => {
    if (activeTopic) {
      router.push(`/dashboard/roadmap/${params.id}?topic=${activeTopic._id}`)
    }
  }
  
  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    
    // Prevent drag if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) return
    
    setIsDragging(true)
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      scrollX: containerRef.current.scrollLeft,
      scrollY: containerRef.current.scrollTop
    }
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none'
  }
  
  // Handle drag move
  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const dx = e.clientX - dragStartPos.current.x
    const dy = e.clientY - dragStartPos.current.y
    
    containerRef.current.scrollLeft = dragStartPos.current.scrollX - dx
    containerRef.current.scrollTop = dragStartPos.current.scrollY - dy
  }
  
  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false)
    document.body.style.userSelect = ''
  }
  
  if (isLoading) {
    return (
      <div className="container py-10 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-[250px]" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }
  
  if (!roadmap) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Roadmap Not Found</CardTitle>
            <CardDescription>
              The roadmap you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  // Group topics by category based on common keywords
  const getCategoryFromTopic = (topic: Topic): string => {
    const name = topic.name.toLowerCase();
    
    if (name.includes('stack')) return 'Stacks';
    if (name.includes('queue')) return 'Queues';
    if (name.includes('recursion')) return 'Recursion';
    if (name.includes('backtrack')) return 'Backtracking';
    if (name.includes('bit') || name.includes('manipulation')) return 'Bit Manipulation';
    if (name.includes('review')) return 'Review';
    if (name.includes('graph')) return 'Graphs';
    if (name.includes('tree')) return 'Trees';
    if (name.includes('dynamic')) return 'Dynamic Programming';
    if (name.includes('sort')) return 'Sorting';
    if (name.includes('search')) return 'Searching';
    if (name.includes('list')) return 'Lists';
    if (name.includes('array')) return 'Arrays';
    
    // Default category
    return 'Other';
  };
  
  // Get all days for color coding
  const allDays = [...new Set(roadmap.topics.map(t => t.day))].sort((a, b) => a - b);
  const dayColorMap: Record<number, string> = {};
  
  // Create a color map for days (different shades)
  allDays.forEach((day, index) => {
    const hue = (index * 20) % 360; // Spread colors across the spectrum
    dayColorMap[day] = `hsl(${hue}, 70%, 35%)`; // Adjust saturation and lightness for dark theme
  });
  
  // Get all categories for category view
  const allCategories = [...new Set(roadmap.topics.map(getCategoryFromTopic))].sort();
  
  return (
    <div className="container py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Map className="mr-2 h-7 w-7 text-blue-500" />
            {roadmap.title}
          </h1>
          <p className="text-muted-foreground mt-1">Your learning journey across {allDays.length} days</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1 border-blue-600/50 bg-blue-950/30 text-blue-300">
            Progress: {roadmap.progress || 0}%
          </Badge>
          <Button onClick={() => router.back()} variant="outline" size="sm" className="border-zinc-700 hover:bg-zinc-800">
            Back
          </Button>
        </div>
      </div>
      
      {/* Modern Card-Based Roadmap Visualization */}
      <div className="bg-[#0f1116] border border-zinc-800 rounded-lg shadow-xl p-6 relative min-h-[700px]">
        {/* Overview Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-200 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Learning Path Overview
          </h2>
          <div className="flex gap-3">
            <Button 
              variant={viewMode === 'day' ? "secondary" : "ghost"} 
              size="sm" 
              className={`h-8 px-2 text-xs ${viewMode === 'day' ? 'bg-blue-950/70 text-blue-300' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'}`}
              onClick={() => setViewMode('day')}
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Day View
            </Button>
            <Button 
              variant={viewMode === 'category' ? "secondary" : "ghost"} 
              size="sm" 
              className={`h-8 px-2 text-xs ${viewMode === 'category' ? 'bg-blue-950/70 text-blue-300' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'}`}
              onClick={() => setViewMode('category')}
            >
              <LayersIcon className="h-3.5 w-3.5 mr-1.5" />
              Category View
            </Button>
          </div>
        </div>
        
        {/* Interactive Roadmap Grid - DAY VIEW */}
        {viewMode === 'day' && (
          <div className="flex flex-wrap gap-4 justify-center">
            {allDays.map((day, index) => {
              const dayTopics = roadmap.topics.filter(t => t.day === day);
              const totalDayTopics = dayTopics.length;
              const completedDayTopics = dayTopics.filter(t => t.completed).length;
              const dayCompletionPercentage = totalDayTopics > 0 
                ? Math.round((completedDayTopics / totalDayTopics) * 100) 
                : 0;
              
              // Group topics by category
              const categoriesInDay: Record<string, Topic[]> = {};
              dayTopics.forEach(topic => {
                const category = getCategoryFromTopic(topic);
                if (!categoriesInDay[category]) {
                  categoriesInDay[category] = [];
                }
                categoriesInDay[category].push(topic);
              });
              
              return (
                <div 
                  key={`day-${day}`}
                  className={`
                    flex flex-col rounded-xl overflow-hidden border
                    ${dayCompletionPercentage === 100 
                      ? 'border-green-800 bg-gradient-to-b from-green-950/40 to-[#0f1116]' 
                      : 'border-blue-800 bg-gradient-to-b from-blue-950/40 to-[#0f1116]'}
                    transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20
                    w-[280px] max-w-[280px]
                  `}
                >
                  {/* Day Header */}
                  <div 
                    className={`
                      px-4 py-3 flex items-center justify-between
                      ${dayCompletionPercentage === 100 
                        ? 'bg-green-900/30 border-b border-green-800' 
                        : 'bg-blue-900/30 border-b border-blue-800'}
                    `}
                  >
                    <div className="flex items-center">
                      <div 
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center mr-2
                          ${dayCompletionPercentage === 100 
                            ? 'bg-green-900 border border-green-500 shadow-sm shadow-green-800/50' 
                            : 'bg-blue-900 border border-blue-500 shadow-sm shadow-blue-800/50'}
                        `}
                      >
                        <span className="text-sm font-bold">{day}</span>
                      </div>
                      <span className="font-medium">Day {day}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`
                        ${dayCompletionPercentage === 100 
                          ? 'bg-green-900/50 text-green-300 border-green-700' 
                          : 'bg-blue-900/50 text-blue-300 border-blue-700'}
                        px-2
                      `}
                    >
                      {dayCompletionPercentage}%
                    </Badge>
                  </div>
                  
                  {/* Day Topic Summary */}
                  <div className="p-3 flex-1">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span>{totalDayTopics} Topics</span>
                      <span>{completedDayTopics} Completed</span>
                    </div>
                    
                    {/* Categories */}
                    <div className="space-y-3 mt-3">
                      {Object.entries(categoriesInDay).map(([category, topics]) => (
                        <div key={`day-${day}-cat-${category}`}>
                          <div className="flex items-center text-xs mb-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                            <span className="text-zinc-300 font-medium">{category}</span>
                            <span className="text-zinc-500 ml-1">
                              ({topics.filter(t => t.completed).length}/{topics.length})
                            </span>
                          </div>
                          
                          {/* Topic Pills */}
                          <div className="flex flex-wrap gap-1.5 pl-3.5">
                            {topics.map(topic => (
                              <div
                                key={topic._id}
                                onClick={() => handleTopicClick(topic)}
                                className={`
                                  py-1 px-2 rounded text-xs cursor-pointer
                                  ${topic.completed 
                                    ? 'bg-green-900/50 text-green-300 border border-green-800'
                                    : 'bg-blue-900/50 text-blue-300 border border-blue-800'} 
                                  ${activeTopic?._id === topic._id ? 'ring-2 ring-yellow-500/70' : ''}
                                  transition-all hover:brightness-110
                                `}
                              >
                                <div className="flex items-center gap-1">
                                  {topic.completed 
                                    ? <CheckCircle2 className="h-3 w-3" /> 
                                    : <Circle className="h-3 w-3" />}
                                  <span className="truncate max-w-[150px]">{topic.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* View Details Button */}
                  <button 
                    className={`
                      w-full py-2 text-sm font-medium flex items-center justify-center
                      ${dayCompletionPercentage === 100 
                        ? 'bg-green-800/50 hover:bg-green-800 text-green-100'
                        : 'bg-blue-800/50 hover:bg-blue-800 text-blue-100'}
                      transition-colors
                    `}
                    onClick={() => {
                      if (dayTopics.length > 0) {
                        setActiveTopic(dayTopics[0]);
                        // Scroll to the details panel smoothly
                        const detailsElement = document.getElementById('topic-details');
                        if (detailsElement) {
                          detailsElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                  >
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              );
            })}
            
            {/* Completion Trophy Card */}
            <div className="w-[220px] h-fit rounded-xl border border-yellow-800 bg-gradient-to-b from-yellow-950/40 to-[#0f1116] flex flex-col items-center justify-center p-6">
              <div className="bg-yellow-900/30 w-16 h-16 rounded-full flex items-center justify-center border-2 border-yellow-600 shadow-sm shadow-yellow-600/20">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="mt-4 text-yellow-300 font-semibold">Complete All Topics</h3>
              <p className="text-xs text-yellow-500/80 text-center mt-2">
                Master all concepts across {allDays.length} days to complete your learning journey
              </p>
              <div className="mt-4 w-full bg-yellow-900/30 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                  style={{ width: `${roadmap.progress || 0}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-yellow-500/80">
                {roadmap.progress || 0}% Complete
              </div>
              
              <Button 
                onClick={() => router.push(`/dashboard/roadmap/${params.id}`)} 
                variant="outline" 
                size="sm" 
                className="mt-4 border-yellow-800/70 text-yellow-300 hover:bg-yellow-900/50"
              >
                Start Learning
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Interactive Roadmap Grid - CATEGORY VIEW */}
        {viewMode === 'category' && (
          <div className="flex flex-wrap gap-4 justify-center">
            {allCategories.map((category) => {
              const categoryTopics = roadmap.topics.filter(t => getCategoryFromTopic(t) === category);
              const totalCategoryTopics = categoryTopics.length;
              const completedCategoryTopics = categoryTopics.filter(t => t.completed).length;
              const categoryCompletionPercentage = totalCategoryTopics > 0 
                ? Math.round((completedCategoryTopics / totalCategoryTopics) * 100) 
                : 0;
              
              // Group topics by day within this category
              const daysInCategory: Record<number, Topic[]> = {};
              categoryTopics.forEach(topic => {
                if (!daysInCategory[topic.day]) {
                  daysInCategory[topic.day] = [];
                }
                daysInCategory[topic.day].push(topic);
              });
              
              return (
                <div 
                  key={`category-${category}`}
                  className={`
                    flex flex-col rounded-xl overflow-hidden border
                    ${categoryCompletionPercentage === 100 
                      ? 'border-green-800 bg-gradient-to-b from-green-950/40 to-[#0f1116]' 
                      : 'border-purple-800 bg-gradient-to-b from-purple-950/40 to-[#0f1116]'}
                    transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20
                    w-[280px] max-w-[280px]
                  `}
                >
                  {/* Category Header */}
                  <div 
                    className={`
                      px-4 py-3 flex items-center justify-between
                      ${categoryCompletionPercentage === 100 
                        ? 'bg-green-900/30 border-b border-green-800' 
                        : 'bg-purple-900/30 border-b border-purple-800'}
                    `}
                  >
                    <div className="flex items-center">
                      <div 
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center mr-2
                          ${categoryCompletionPercentage === 100 
                            ? 'bg-green-900 border border-green-500 shadow-sm shadow-green-800/50' 
                            : 'bg-purple-900 border border-purple-500 shadow-sm shadow-purple-800/50'}
                        `}
                      >
                        <LayersIcon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{category}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`
                        ${categoryCompletionPercentage === 100 
                          ? 'bg-green-900/50 text-green-300 border-green-700' 
                          : 'bg-purple-900/50 text-purple-300 border-purple-700'}
                        px-2
                      `}
                    >
                      {categoryCompletionPercentage}%
                    </Badge>
                  </div>
                  
                  {/* Category Topic Summary */}
                  <div className="p-3 flex-1">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span>{totalCategoryTopics} Topics</span>
                      <span>{completedCategoryTopics} Completed</span>
                    </div>
                    
                    {/* Days */}
                    <div className="space-y-3 mt-3">
                      {Object.entries(daysInCategory).sort((a, b) => Number(a[0]) - Number(b[0])).map(([day, topics]) => (
                        <div key={`category-${category}-day-${day}`}>
                          <div className="flex items-center text-xs mb-1">
                            <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
                            <span className="text-zinc-300 font-medium">Day {day}</span>
                            <span className="text-zinc-500 ml-1">
                              ({topics.filter(t => t.completed).length}/{topics.length})
                            </span>
                          </div>
                          
                          {/* Topic Pills */}
                          <div className="flex flex-wrap gap-1.5 pl-3.5">
                            {topics.map(topic => (
                              <div
                                key={topic._id}
                                onClick={() => handleTopicClick(topic)}
                                className={`
                                  py-1 px-2 rounded text-xs cursor-pointer
                                  ${topic.completed 
                                    ? 'bg-green-900/50 text-green-300 border border-green-800'
                                    : 'bg-purple-900/50 text-purple-300 border border-purple-800'} 
                                  ${activeTopic?._id === topic._id ? 'ring-2 ring-yellow-500/70' : ''}
                                  transition-all hover:brightness-110
                                `}
                              >
                                <div className="flex items-center gap-1">
                                  {topic.completed 
                                    ? <CheckCircle2 className="h-3 w-3" /> 
                                    : <Circle className="h-3 w-3" />}
                                  <span className="truncate max-w-[150px]">{topic.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* View Details Button */}
                  <button 
                    className={`
                      w-full py-2 text-sm font-medium flex items-center justify-center
                      ${categoryCompletionPercentage === 100 
                        ? 'bg-green-800/50 hover:bg-green-800 text-green-100'
                        : 'bg-purple-800/50 hover:bg-purple-800 text-purple-100'}
                      transition-colors
                    `}
                    onClick={() => {
                      if (categoryTopics.length > 0) {
                        setActiveTopic(categoryTopics[0]);
                        // Scroll to the details panel smoothly
                        const detailsElement = document.getElementById('topic-details');
                        if (detailsElement) {
                          detailsElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                  >
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              );
            })}
            
            {/* Completion Trophy Card */}
            <div className="w-[220px] h-fit rounded-xl border border-yellow-800 bg-gradient-to-b from-yellow-950/40 to-[#0f1116] flex flex-col items-center justify-center p-6">
              <div className="bg-yellow-900/30 w-16 h-16 rounded-full flex items-center justify-center border-2 border-yellow-600 shadow-sm shadow-yellow-600/20">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="mt-4 text-yellow-300 font-semibold">Complete All Topics</h3>
              <p className="text-xs text-yellow-500/80 text-center mt-2">
                Master all concepts across {allCategories.length} categories to complete your learning journey
              </p>
              <div className="mt-4 w-full bg-yellow-900/30 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                  style={{ width: `${roadmap.progress || 0}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-yellow-500/80">
                {roadmap.progress || 0}% Complete
              </div>
              
              <Button 
                onClick={() => router.push(`/dashboard/roadmap/${params.id}`)} 
                variant="outline" 
                size="sm" 
                className="mt-4 border-yellow-800/70 text-yellow-300 hover:bg-yellow-900/50"
              >
                Start Learning
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Active topic details panel - same as before */}
      {activeTopic && (
        <div id="topic-details" className="bg-[#0f1116] text-white border border-zinc-800 rounded-lg shadow-xl overflow-hidden scroll-mt-4">
          <div className="border-b border-zinc-800 bg-zinc-900/50">
            <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-start">
                  <h2 className="text-xl font-bold">{activeTopic.name}</h2>
                  <Badge className="ml-2 mt-1 bg-blue-600/20 text-blue-400 border border-blue-900" variant="outline">
                    {getCategoryFromTopic(activeTopic)}
                  </Badge>
                </div>
                <div className="flex items-center mt-2 text-sm text-zinc-400">
                  <span className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" /> Day {activeTopic.day}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <LayersIcon className="h-3.5 w-3.5 mr-1" /> Position {activeTopic.position || 1}
                  </span>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`
                  ${activeTopic.completed ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}
                  px-3 py-1 text-xs font-medium
                `}
              >
                {activeTopic.completed ? "Completed" : "In Progress"}
              </Badge>
            </div>
          </div>
          
          <div className="p-4 md:p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-zinc-300 flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                Learning Objectives
              </h3>
              <ul className="space-y-2 pl-6">
                {activeTopic.queries.map((query, index) => (
                  <li key={index} className="text-sm relative">
                    <div className="absolute left-[-1rem] top-[0.4rem] w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-zinc-300">{query}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {activeTopic.links && activeTopic.links[0] && activeTopic.links[0].length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 text-zinc-300 flex items-center">
                  <Video className="h-4 w-4 mr-2 text-blue-500" />
                  Learning Progress
                </h3>
                <div className="space-y-3 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Videos Completed</span>
                    <span className="text-zinc-300 font-medium">
                      {activeTopic.links[0].filter(url => roadmap.completedVideos?.includes(url)).length}/{activeTopic.links[0].length}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${activeTopic.completed ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}
                      style={{ 
                        width: `${activeTopic.links[0].length > 0
                          ? (activeTopic.links[0].filter(url => roadmap.completedVideos?.includes(url)).length / activeTopic.links[0].length) * 100
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={navigateToLearning} 
                className={`flex-1 ${activeTopic.completed ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {activeTopic.completed ? "Review Content" : "Start Learning"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setActiveTopic(null)}
                className="border-zinc-700 hover:bg-zinc-800"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
