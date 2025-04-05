// components/ui/badges-list.tsx
"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Award, BookOpen, Clock, Loader2, Star, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

interface BadgeData {
  _id?: string;
  id?: number;
  badgeId?: number;
  name: string;
  description: string;
  icon?: React.ReactNode;
  iconType?: string;
  earned: boolean;
  date?: string;
  earnedDate?: string;
  progress?: number;
  total?: number;
}

// Mock data as fallback if API fails
const mockBadges = [
  {
    id: 1,
    name: "Fast Learner",
    description: "Completed 5 topics in a single day",
    icon: <Zap className="h-4 w-4" />,
    earned: true,
    date: "Apr 2, 2025",
  },
  {
    id: 2,
    name: "Quiz Master",
    description: "Scored 100% in 3 consecutive quizzes",
    icon: <Star className="h-4 w-4" />,
    earned: true,
    date: "Mar 28, 2025",
  },
  {
    id: 3,
    name: "Dedicated Scholar",
    description: "Studied for more than 10 hours in a week",
    icon: <Clock className="h-4 w-4" />,
    earned: true,
    date: "Apr 5, 2025",
  },
  {
    id: 4,
    name: "Knowledge Seeker",
    description: "Completed 20 topics",
    icon: <BookOpen className="h-4 w-4" />,
    earned: false,
    progress: 18,
    total: 20,
  },
  {
    id: 5,
    name: "Perfect Attendance",
    description: "Logged in for 14 consecutive days",
    icon: <Award className="h-4 w-4" />,
    earned: false,
    progress: 8,
    total: 14,
  },
]

// Helper function to get the appropriate icon based on iconType
const getIconByType = (iconType: string) => {
  switch (iconType) {
    case "zap":
      return <Zap className="h-4 w-4" />;
    case "star":
      return <Star className="h-4 w-4" />;
    case "clock":
      return <Clock className="h-4 w-4" />;
    case "book":
      return <BookOpen className="h-4 w-4" />;
    case "award":
      return <Award className="h-4 w-4" />;
    default:
      return <Award className="h-4 w-4" />;
  }
}

// Function to format date from API
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function BadgesList() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeData[]>(mockBadges);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchBadges = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/badges?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch badges");
        }
        
        const data = await response.json();
        
        if (data.success && data.badges) {
          // Transform API data to match component's expected format
          const formattedBadges = data.badges.map((badge: any) => ({
            _id: badge._id,
            badgeId: badge.badgeId,
            name: badge.name,
            description: badge.description,
            iconType: badge.iconType,
            earned: badge.earned,
            earnedDate: badge.earnedDate,
            progress: badge.progress,
            total: badge.total
          }));
          
          setBadges(formattedBadges);
        } else {
          // Fallback to mock data if API returns no badges
          setBadges(mockBadges);
        }
      } catch (error) {
        console.error("Error fetching badges:", error);
        // Fallback to mock data on error
        setBadges(mockBadges);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBadges();
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {badges.map((badge) => (
        <div
          key={badge._id || badge.id || badge.badgeId}
          className={`flex items-center gap-4 rounded-lg border p-4 ${
            badge.earned ? "border-gray-700 bg-gray-800/50" : "border-gray-800 bg-gray-900"
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              badge.earned ? "bg-purple-500/20 text-purple-400" : "bg-gray-800 text-gray-500"
            }`}
          >
            {badge.icon || (badge.iconType && getIconByType(badge.iconType))}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{badge.name}</h3>
              {badge.earned && (
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-800">
                  Earned
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-400">{badge.description}</p>
            {badge.earned ? (
              <p className="mt-1 text-xs text-gray-500">
                Earned on {badge.date || (badge.earnedDate && formatDate(badge.earnedDate))}
              </p>
            ) : (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Progress</span>
                  <span className="text-gray-400">
                    {badge.progress}/{badge.total}
                  </span>
                </div>
                {!badge.earned && badge.progress !== undefined && badge.total !== undefined && (
                  <Progress 
                    value={(badge.progress / badge.total) * 100} 
                    className="h-1 mt-1 bg-gray-800" 
                  />
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}