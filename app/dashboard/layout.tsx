"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, ChevronLeft, ChevronRight, Home, LayoutDashboard, LogOut, Menu, Settings, Users, Trophy } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "@/components/theme-toggle"
import { LearningTimer } from "@/components/learning-timer"
import { Webchat, WebchatProvider, Fab, getClient } from "@botpress/webchat";
import { buildTheme } from "@botpress/webchat-generator";
import { ProfileMenu } from "@/components/profile-menu"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut, loading: isLoading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const [profileData, setProfileData] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      setProfileLoading(true);
      try {
        const response = await fetch(`/api/profile?userId=${user.id}`);
        const data = await response.json();
        
        if (data.success && data.profile) {
          setProfileData(data.profile);
        } else if (response.status === 404) {
          // No profile exists yet - we'll use auth data
          console.log("No profile found in MongoDB");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const getUserName = () => {
    if (profileData?.name) {
      return profileData.name;
    }
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  };
  
  const getUserInitials = () => {
    if (profileData?.name) {
      return profileData.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Weekly Progress",
      href: "/dashboard/weeklyprogress",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Community",
      href: "/dashboard/community",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Leaderboard",
      href: "/dashboard/leaderboard",
      icon: <Trophy className="h-5 w-5" />,
    },

    {
      title: "About",
      href: "/dashboard/about",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 ease-in-out dark:bg-zinc-900 md:relative ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:w-20 md:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            {isSidebarOpen ? (
              <span className="text-xl font-bold">Ascend Flow</span>
            ) : (
              <span className="text-xl font-bold">AF</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                } ${!isSidebarOpen && "justify-center md:px-2"}`}
              >
                {item.icon}
                {isSidebarOpen && <span>{item.title}</span>}
              </Link>
            ))}
          </nav>
          
          <div className="mt-6 px-3">
            {/* No more Roadmaps section */}
          </div>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            {isSidebarOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={profileData?.profileImage || user?.user_metadata?.avatar_url || ""} 
                    />
                    <AvatarFallback>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {getUserName()}
                    </p>
                    {profileData && (
                      <p className="text-xs text-muted-foreground">
                        {profileData.coins || 0} coins
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <div className="flex w-full justify-between">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={profileData?.profileImage || user?.user_metadata?.avatar_url || ""} 
                  />
                  <AvatarFallback>
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="fixed left-1/2 ">
              <LearningTimer />
            </div>
          </div>

          <div className="flex items-center gap-4">
          <ThemeToggle />
            <ProfileMenu user={user} />
            
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
