"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, BookOpen, Clock, GraduationCap, ListChecks } from "lucide-react"
import { LearningTimeChart } from "@/components/learning-time-chart"
import { QuizScoreChart } from "@/components/quiz-score-chart"
import { BadgesList } from "@/components/badges-list"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { LearningGraph } from "@/components/LearningGraph"

interface Roadmap {
  _id: string
  roadmapId: string
  title: string
  description: string
  topics: Topic[]
  completedVideos: string[]
  progress: number
  totalVideos: number
}

interface Topic {
  _id: string
  name: string
  links: string[][]
  completed: boolean
}

export default function WeeklyProgressPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [selectedRoadmap, setSelectedRoadmap] = useState<string>("")
  const [overallProgress, setOverallProgress] = useState(0)
  const [totalTopics, setTotalTopics] = useState(0)
  const [pendingTopics, setPendingTopics] = useState(0)
  const [timeSpent, setTimeSpent] = useState("")
  
  // Fetch all roadmaps for the user
  useEffect(() => {
    if (!user) return
    
    const fetchRoadmaps = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/roadmaps/user?supabaseUserId=${user.id}`)
        const data = await response.json()
        
        if (data.success && data.roadmaps.length > 0) {
          setRoadmaps(data.roadmaps)
          setSelectedRoadmap(data.roadmaps[0].roadmapId)
        }
      } catch (error) {
        console.error("Error fetching roadmaps:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRoadmaps()
  }, [user])
  
  // Fetch today's learning time
  useEffect(() => {
    if (!user) return
    
    const fetchTodayTime = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]
        const response = await fetch(`/api/roadmaps/update-time?userId=${user.id}&date=${today}`)
        const data = await response.json()
        
        if (data.learningTime) {
          const hours = Math.floor(data.learningTime / 3600)
          const minutes = Math.floor((data.learningTime % 3600) / 60)
          setTimeSpent(`${hours}h ${minutes}m`)
        } else {
          setTimeSpent("0h 0m")
        }
      } catch (error) {
        console.error("Error fetching learning time:", error)
      }
    }
    
    fetchTodayTime()
  }, [user])
  
  // Update metrics when selected roadmap changes
  useEffect(() => {
    if (!selectedRoadmap || roadmaps.length === 0) return
    
    const roadmap = roadmaps.find(r => r.roadmapId === selectedRoadmap)
    
    if (roadmap) {
      setOverallProgress(roadmap.progress)
      setTotalTopics(roadmap.topics.length)
      
      const completedTopics = roadmap.topics.filter(topic => topic.completed).length
      setPendingTopics(roadmap.topics.length - completedTopics)
    }
  }, [selectedRoadmap, roadmaps])
  
  return (
    <div className="flex min-h-screen w-full flex-col text-white">
      <div className="flex flex-col">
        <header className="top-0 z-10 flex h-16 items-center gap-4 border-b border-purple-600/50 px-4 md:px-6">
          <h1 className="text-xl font-semibold">Weekly Progress</h1>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{timeSpent}</span>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {/* Roadmap Selector */}
          <div className="w-full max-w-xs">
            <Select 
              value={selectedRoadmap} 
              onValueChange={setSelectedRoadmap}
              disabled={isLoading || roadmaps.length === 0}
            >
              <SelectTrigger className="bg-gray-900 border border-purple-500/30">
                <SelectValue placeholder="Select a roadmap" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border border-purple-500/30">
                {roadmaps.map(roadmap => (
                  <SelectItem 
                    key={roadmap.roadmapId} 
                    value={roadmap.roadmapId}
                    className="focus:bg-purple-900/20 focus:text-white"
                  >
                    {roadmap.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gray-900 border-0 relative before:absolute before:inset-0 before:p-[1px] before:rounded-lg before:bg-gradient-to-r before:from-purple-500/30 before:via-purple-600/50 before:to-purple-400/30 before:-z-10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Your Learning</CardTitle>
                <GraduationCap className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallProgress}%</div>
                <p className="text-xs text-gray-400">Overall progress</p>
                <Progress value={overallProgress} className="mt-2 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-purple-400" />
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-0 relative before:absolute before:inset-0 before:p-[1px] before:rounded-lg before:bg-gradient-to-r before:from-purple-500/30 before:via-purple-600/50 before:to-purple-400/30 before:-z-10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
                <BookOpen className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTopics}</div>
                <p className="text-xs text-gray-400">Topics in your curriculum</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-0 relative before:absolute before:inset-0 before:p-[1px] before:rounded-lg before:bg-gradient-to-r before:from-purple-500/30 before:via-purple-600/50 before:to-purple-400/30 before:-z-10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Topics</CardTitle>
                <ListChecks className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingTopics}</div>
                <p className="text-xs text-gray-400">Topics remaining</p>
                <Progress value={(totalTopics - pendingTopics) / totalTopics * 100} className="mt-2 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-purple-400" />
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-0 relative before:absolute before:inset-0 before:p-[1px] before:rounded-lg before:bg-gradient-to-r before:from-purple-500/30 before:via-purple-600/50 before:to-purple-400/30 before:-z-10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Time Spent</CardTitle>
                <Clock className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timeSpent}</div>
                <p className="text-xs text-gray-400">Today</p>
              </CardContent>
            </Card>
          </div>
          <Tabs defaultValue="time" className="space-y-4">
            <TabsList className="border border-purple-500/30 bg-transparent">
              <TabsTrigger value="time" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                Learning Time
              </TabsTrigger>
            </TabsList>
            <TabsContent value="time" className="space-y-4">
              <Card className="border-0 relative before:absolute before:inset-0 before:p-[1px] before:rounded-lg before:bg-gradient-to-r before:from-purple-500/30 before:via-purple-600/50 before:to-purple-400/30 before:-z-10 overflow-hidden">
                <CardHeader>
                  <CardTitle>Last 7 Days Learning Time</CardTitle>
                  <CardDescription className="text-gray-400">Track your daily learning time</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <LearningGraph />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <Card className="bg-gray-900 border-0 relative before:absolute before:inset-0 before:p-[1px] before:rounded-lg before:bg-gradient-to-r before:from-purple-500/30 before:via-purple-600/50 before:to-purple-400/30 before:-z-10 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Badges Achieved</CardTitle>
              <Award className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <BadgesList />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

