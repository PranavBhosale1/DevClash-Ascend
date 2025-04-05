"use client";

import { useEffect, useState } from "react";
import { Clock, Play, Pause } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

interface DailyProgress {
  date: string;
  time: number;
}

export function LearningTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const { user } = useAuth();

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const saveTimeToDatabase = async (newTime: number) => {
    if (!user?.id) return console.warn("⚠️ User not logged in, skipping MongoDB update.");
    
    try {
      console.log("📡 Sending updated time to MongoDB:", newTime);
      const response = await fetch("/api/roadmaps/update-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          date: getTodayDate(), // ✅ Ensure consistent date format
          time: newTime,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to update MongoDB");
      console.log("✅ Time successfully saved to MongoDB.");
    } catch (error) {
      console.error("❌ Error saving to MongoDB:", error);
    }
  };
  
  // ✅ Auto-save progress every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("⏳ Auto-saving time...");
      saveTimeToDatabase(time); // Save the latest time
    }, 10000); // Every 10 seconds
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, [time]);
  
  // ✅ Save before page refresh or close
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("🔄 Page closing, saving progress...");
      saveTimeToDatabase(time);
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [time]);

  const loadTimeFromDatabase = async () => {
    if (!user?.id) return console.warn("⚠️ User not logged in, skipping MongoDB load.");
  
    try {
      console.log("📡 Fetching today's time from MongoDB...");
      const today = new Date().toISOString().split("T")[0]; // ✅ Ensure `YYYY-MM-DD` format
      
      const response = await fetch(`/api/roadmaps/update-time?userId=${user.id}&date=${today}`);
      const data = await response.json();
  
      if (data?.learningTime !== undefined) {
        console.log(`✅ Loaded time from MongoDB: ${data.learningTime}`);
        setTime(data.learningTime);
      } else {
        console.log("❌ No entry found for today in MongoDB, starting fresh.");
        setTime(0);
      }
    } catch (error) {
      console.error("❌ Error loading time from MongoDB:", error);
    }
  };
  

  useEffect(() => {
    if (user?.id) {
      loadTimeFromDatabase();
    }
  }, [user?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRunning) return;
      setTime((prevTime) => {
        const newTime = prevTime + 1;
        console.log("⏳ Updating time:", newTime);
        if (newTime % 60 === 0) saveTimeToDatabase(newTime);
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, user?.id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("🛑 Tab hidden, pausing timer...");
        setIsRunning(false);
        saveTimeToDatabase(time);
      } else {
        console.log("▶️ Tab visible, resuming timer...");
        setIsRunning(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [time]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  return (
    <Card className="p-4 flex items-center gap-2 bg-primary/5">
      <Clock className="h-5 w-5 text-primary" />
      <div className="font-medium">
        {hours.toString().padStart(2, "0")}:
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </div>
      <div className="flex items-center gap-1 ml-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            console.log(isRunning ? "⏸️ Pausing Timer" : "▶️ Starting Timer");
            setIsRunning(!isRunning);
            if (!isRunning) {
              saveTimeToDatabase(time);
            }
          }}
          className="h-8 w-8"
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
    </Card>
  );
}
