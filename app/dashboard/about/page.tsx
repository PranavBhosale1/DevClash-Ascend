import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink, Github, Heart, MessageCircle } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">About Ascend Flow</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Learning Made Easy</CardTitle>
            <CardDescription>
              Our mission is to help you learn effectively through structured roadmaps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Ascend Flow is a modern learning platform designed to make your educational journey 
              organized, efficient, and enjoyable. We provide customized roadmaps based on your learning goals
              and help you track your progress.
            </p>
            <p>
              With our intelligent progress tracking, embedded video lessons, and personalized roadmaps,
              you can focus on what matters - your learning journey.
            </p>
            <div className="flex space-x-2 mt-4">
              <Button variant="outline" asChild>
                <Link href="https://github.com/yourusername/ascend" target="_blank">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact" target="_blank">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>
              What makes Ascend Flow special
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Personalized Roadmaps</h3>
                  <p className="text-sm text-muted-foreground">Create custom learning plans based on your goals and preferences</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Progress Tracking</h3>
                  <p className="text-sm text-muted-foreground">Monitor your learning journey with detailed analytics and insights</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M2 12h10" />
                    <path d="M9 4v16" />
                    <path d="M14 9h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">In-App Video Learning</h3>
                  <p className="text-sm text-muted-foreground">Watch educational videos directly in the platform without leaving</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">MongoDB Integration</h3>
                  <p className="text-sm text-muted-foreground">Reliable data storage and retrieval for your learning materials and progress</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Our Team</CardTitle>
            <CardDescription>
              The people behind Ascend Flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold">GS</span>
                </div>
                <h3 className="font-medium">Gaurav Singh</h3>
                <p className="text-sm text-muted-foreground">Founder & Developer</p>
                <p className="text-xs mt-2">Passionate about education technology and making learning accessible to everyone.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="font-medium">Our Users</h3>
                <p className="text-sm text-muted-foreground">The Heart of Ascend</p>
                <p className="text-xs mt-2">We're dedicated to improving your learning experience every day.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ExternalLink className="h-8 w-8" />
                </div>
                <h3 className="font-medium">Join Our Team</h3>
                <p className="text-sm text-muted-foreground">We're Hiring!</p>
                <p className="text-xs mt-2">Passionate about education? Let's transform learning together.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 