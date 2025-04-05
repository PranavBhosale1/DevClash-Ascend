// components/profile-menu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { User } from "@supabase/auth-helpers-nextjs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  User as UserIcon, 
  Settings, 
  LogOut,
  Trophy,
  Coins
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

interface ProfileMenuProps {
  user?: User | null;
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Fetch profile data when dropdown opens
  const handleDropdownOpen = async () => {
    if (!user || profileData) return;
    
    try {
      const response = await fetch(`/api/profile?userId=${user.id}`);
      const data = await response.json();

      if (data.success && data.profile) {
        setProfileData(data.profile);
      } 
      // If no profile exists yet and this is first login, try to create one
      else if (response.status === 404) {
        // Create a default profile with user's name from auth data and a default image
        const name = user.user_metadata?.full_name || 'User';
        const defaultImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        
        const createResponse = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            name,
            profileImage: defaultImageUrl,
          }),
        });
        
        const createData = await createResponse.json();
        if (createData.success) {
          setProfileData(createData.profile);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };
  
  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get user's initials for the avatar fallback
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

  return (
    <DropdownMenu onOpenChange={handleDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={profileData?.profileImage || user?.user_metadata?.avatar_url || ""} 
              alt={profileData?.name || user?.user_metadata?.full_name || "User"} 
            />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profileData?.name || user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        {profileData && (
          <div className="px-2 py-1.5">
            <div className="flex items-center mb-1">
              <Coins className="mr-2 h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">{profileData.coins || 0} coins</span>
            </div>
          </div>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/dashboard/leaderboard" className="cursor-pointer">
            <Trophy className="mr-2 h-4 w-4" />
            <span>Leaderboard</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600" 
          disabled={isLoading}
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}