// app/dashboard/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2, Upload, Shield, Trophy, History, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentProfileUrl, setCurrentProfileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/profile?userId=${user.id}`);
        const data = await response.json();

        if (data.success && data.profile) {
          setName(data.profile.name || "");
          setCurrentProfileUrl(data.profile.profileImage || null);
          setCoins(data.profile.coins || 0);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setProfileImage(file);
    
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      if (!user) {
        throw new Error("You must be logged in to update your profile");
      }

      if (!name) {
        throw new Error("Please provide your name");
      }

      // Create object for profile update
      const profileUpdate: { userId: string; name: string; profileImage?: string } = {
        userId: user.id,
        name,
      };

      // Only upload a new image if one was selected
      if (profileImage) {
        try {
          // Check if the bucket exists, and try to create it if it doesn't
          const { data: buckets } = await supabase.storage.listBuckets();
          const profileBucket = buckets?.find(bucket => bucket.name === 'profiles');
          
          if (!profileBucket) {
            // Try to create the bucket
            const { error: createBucketError } = await supabase.storage.createBucket('profiles', {
              public: true,
              fileSizeLimit: 5242880, // 5MB
            });
            
            if (createBucketError) {
              console.error("Error creating bucket:", createBucketError);
              // Fallback to using a data URL for the image
              const reader = new FileReader();
              const dataUrlPromise = new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
              });
              reader.readAsDataURL(profileImage);
              
              profileUpdate.profileImage = await dataUrlPromise;
            }
          }
          
          // Try to upload to Supabase Storage if we didn't use a data URL above
          if (!profileUpdate.profileImage) {
            const fileName = `profile-${user.id}-${Date.now()}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("profiles")
              .upload(fileName, profileImage);

            if (uploadError) {
              throw uploadError;
            }

            // Get public URL of the uploaded image
            const { data: publicUrlData } = supabase.storage
              .from("profiles")
              .getPublicUrl(fileName);

            profileUpdate.profileImage = publicUrlData.publicUrl;
          }
        } catch (uploadError: any) {
          console.error("Upload error:", uploadError);
          // Use a data URL as fallback
          const reader = new FileReader();
          const dataUrlPromise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
          });
          reader.readAsDataURL(profileImage);
          
          profileUpdate.profileImage = await dataUrlPromise;
        }
      }

      // Update profile in MongoDB
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileUpdate),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Update current profile URL if image was changed
      if (profileUpdate.profileImage) {
        setCurrentProfileUrl(profileUpdate.profileImage);
      }

      // Clear image selection
      setProfileImage(null);
      setImagePreview(null);

      // Show success message
      setSuccessMessage("Profile updated successfully!");
    } catch (error: any) {
      setError(error.message || "Something went wrong");
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-muted-foreground mb-6">Manage your account and view your learning progress</p>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile details and how you appear to others.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && (
                  <div className="bg-red-50 p-4 rounded-md text-red-800 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                  </div>
                )}
                
                {successMessage && (
                  <div className="bg-green-50 p-4 rounded-md text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    {successMessage}
                  </div>
                )}
                
                <div className="flex flex-col items-center space-y-4 pt-4">
                  <Avatar className="h-32 w-32">
                    {(imagePreview || currentProfileUrl) ? (
                      <AvatarImage
                        src={imagePreview || currentProfileUrl || ""}
                        alt={name}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="text-3xl">
                      {name
                        ? name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center">
                    <Label
                      htmlFor="profileImageInput"
                      className="cursor-pointer text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Change profile picture
                    </Label>
                    <input
                      id="profileImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isSaving}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your email address is managed through your authentication provider
                  </p>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-primary/5 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{coins} Coins</p>
                    <p className="text-xs text-muted-foreground">
                      Earn coins by completing learning activities
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>
                  Your learning activity over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg p-4">
                  <p className="text-muted-foreground text-center">
                    Learning progress visualization<br/>
                    (Coming soon)
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Activity Stats</CardTitle>
                <CardDescription>
                  Your learning stats and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div className="flex gap-2 items-center">
                      <History className="h-5 w-5 text-primary" />
                      <span>Total Learning Time</span>
                    </div>
                    <span className="font-medium">12 hours 34 min</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div className="flex gap-2 items-center">
                      <Award className="h-5 w-5 text-primary" />
                      <span>Topics Completed</span>
                    </div>
                    <span className="font-medium">8</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div className="flex gap-2 items-center">
                      <Trophy className="h-5 w-5 text-primary" />
                      <span>Current Streak</span>
                    </div>
                    <span className="font-medium">4 days</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <Shield className="h-5 w-5 text-primary" />
                      <span>Leaderboard Position</span>
                    </div>
                    <span className="font-medium">#12</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                Badges and rewards you've earned through learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Achievement Card - Locked */}
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  <div className="aspect-square bg-muted flex items-center justify-center p-6 opacity-50">
                    <Award className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-muted-foreground">First Milestone</h3>
                    <p className="text-xs text-muted-foreground mt-1">Complete your first roadmap</p>
                  </div>
                </div>
                
                {/* Achievement Card - Locked */}
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  <div className="aspect-square bg-muted flex items-center justify-center p-6 opacity-50">
                    <Trophy className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-muted-foreground">Week Warrior</h3>
                    <p className="text-xs text-muted-foreground mt-1">Learn for 7 consecutive days</p>
                  </div>
                </div>
                
                {/* Achievement Card - Locked */}
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  <div className="aspect-square bg-muted flex items-center justify-center p-6 opacity-50">
                    <Shield className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-muted-foreground">Knowledge Guardian</h3>
                    <p className="text-xs text-muted-foreground mt-1">Complete 10 learning sessions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Password</h3>
                <p className="text-sm text-muted-foreground">
                  Your password is managed through your authentication provider.
                </p>
                {user?.app_metadata?.provider === 'email' && (
                  <Button variant="outline" size="sm" disabled>
                    Change Password
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-medium">Connected Accounts</h3>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-[#4285F4] flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Google</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.app_metadata?.provider === 'google' 
                          ? 'Connected' 
                          : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    {user?.app_metadata?.provider === 'google' 
                      ? 'Disconnect' 
                      : 'Connect'}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all of your data.
                </p>
                <Button variant="destructive" size="sm" disabled>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}