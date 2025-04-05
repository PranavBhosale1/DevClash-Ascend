"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { BookOpen, Video, ChevronDown, ChevronRight, ChevronLeft, Bookmark, FileText, Download, ArrowLeft, CheckCircle, Check, Map } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "sonner"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import axios from "axios";
import { jsPDF } from "jspdf";
import Chat from '@/components/chat';
import { AliveScope, KeepAlive } from 'react-activation';
import { Edit, Save } from "lucide-react";
import QuizModal from "@/components/QuizModal"
// MongoDB Roadmap interface
interface MongoRoadmap {
  _id: string;
  roadmapId: string;
  userId: string;
  supabaseUserId: string;
  title: string;
  description: string;
  topics: Topic[];
  completedVideos?: string[];
  createdAt: string;
  updatedAt: string;
}

// Topic interface from MongoDB
interface Topic {
  name: string;
  queries: string[];
  links: string[][];
  day: number;
  position: number;
  _id: string;
}

// Add this function before the RoadmapPage component
function getEmbedUrl(url: string): string {
  if (!url) return ''

  // Handle YouTube URLs
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(youtubeRegex)

  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`
  }

  // Handle Vimeo URLs
  const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/
  const vimeoMatch = url.match(vimeoRegex)

  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  return url
}

export default function RoadmapViewPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [roadmap, setRoadmap] = useState<MongoRoadmap | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTopicIndex, setActiveTopicIndex] = useState<number>(0)
  const [expandedTopics, setExpandedTopics] = useState<string[]>([])
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)
  const [activeQueryIndex, setActiveQueryIndex] = useState<number>(0)
  const [completedTopics, setCompletedTopics] = useState<string[]>([])
  const [completedVideos, setCompletedVideos] = useState<string[]>([])
  const [progress, setProgress] = useState<number>(0)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [notes, setnotes] = useState<string>('');
  const [transcript, setTranscript] = useState<string | null>(null); // Make sure this is defined
  const [tabValue, setTabValue] = useState<string>(() => localStorage.getItem('selectedTab') || 'video');
  const [previousUrl, setPreviousUrl] = useState<string>(activeVideoUrl || ''); // Fallback to empty string if null
  const [isEditable, setIsEditable] = useState(false);
  const [editableNotes, setEditableNotes] = useState(cleanTranscript(notes) || "");
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizNotes, setQuizNote] = useState<QuizQuestion[]>([]);

  interface QuizQuestion {
    question: string;
    options: string[];
  }

  useEffect(() => {
    if (activeVideoUrl) {
      fetchTranscript();
    }
  }, [activeVideoUrl]);

  const toggleEdit = () => {
    setIsEditable(!isEditable);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableNotes(e.target.value);
  };
  useEffect(() => {
    setEditableNotes(cleanTranscript(notes) || "");
  }, [notes]);

  useEffect(() => {
    if (activeVideoUrl !== previousUrl) {
      // Reset tab to 'video' when activeVideoUrl changes
      setTabValue('video');
      localStorage.setItem('selectedTab', 'video');
      setPreviousUrl(activeVideoUrl ?? ''); // If it's null, use an empty string
      // Update the previous URL to the current URL
    }
  }, [activeVideoUrl, previousUrl]);

  const handleTabChange = (value: string) => {
    setTabValue(value);
    localStorage.setItem('selectedTab', value); // Save the selected tab to localStorage
  };

  useEffect(() => {
    if (user && params.id) {
      fetchRoadmap(params.id as string)
    }
  }, [user, params.id])

  // Calculate progress whenever completedVideos changes
  useEffect(() => {
    if (roadmap) {
      const totalVideos = roadmap.topics.reduce((total, topic) => {
        return total + topic.links.reduce((sum, linkGroup) => sum + linkGroup.length, 0);
      }, 0);

      const newProgress = totalVideos > 0
        ? Math.round((completedVideos.length / totalVideos) * 100)
        : 0;

      setProgress(newProgress);
    }
  }, [completedVideos, roadmap]);

  const fetchRoadmap = async (roadmapId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Fetch roadmap from MongoDB using the API
      const response = await fetch(`/api/roadmaps/get?roadmapId=${roadmapId}&supabaseUserId=${user.id}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('MongoDB API error:', errorData);
        toast.error("Failed to load roadmap", {
          description: errorData.message || "There was an error isLoading the roadmap from MongoDB"
        });
        return;
      }

      const data = await response.json();

      if (data.success && data.roadmap) {
        console.log('Fetched roadmap from MongoDB:', data.roadmap);
        setRoadmap(data.roadmap);

        // Set completed videos from stored data
        if (data.roadmap.completedVideos) {
          console.log('Setting completed videos:', data.roadmap.completedVideos);
          setCompletedVideos(data.roadmap.completedVideos);

          // Calculate progress based on the number of completed videos
          const totalVideos = data.roadmap.topics.reduce((total: number, topic: any) => {
            return total + topic.links.reduce((sum: number, linkGroup: string[]) => sum + linkGroup.length, 0);
          }, 0);

          const newProgress = totalVideos > 0
            ? Math.round((data.roadmap.completedVideos.length / totalVideos) * 100)
            : 0;

          setProgress(newProgress);
        }

        // Set completed topics based on data
        const completedTopicIds = data.roadmap.topics
          .filter((topic: any) => topic.completed)
          .map((topic: any) => topic._id);
        setCompletedTopics(completedTopicIds);

        // Set initial states
        if (data.roadmap.topics && data.roadmap.topics.length > 0) {
          const firstTopic = data.roadmap.topics[0];
          setExpandedTopics([firstTopic._id]);

          // Set first video as active if available
          if (firstTopic.links && firstTopic.links.length > 0 &&
            firstTopic.links[0] && firstTopic.links[0].length > 0) {
            setActiveVideoUrl(firstTopic.links[0][0]);
          }
        }
      } else {
        console.error('Failed to fetch MongoDB roadmap:', data.message);
        toast.error("Roadmap not found", {
          description: "The requested roadmap could not be found"
        });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching MongoDB roadmap:', error);
      toast.error("Failed to load roadmap", {
        description: "There was an error connecting to MongoDB"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save progress to MongoDB
  const saveProgress = useCallback(async () => {
    if (!user || !roadmap) return;

    try {
      setIsSaving(true);

      // Prepare data for saving
      const updatedData = {
        roadmapId: roadmap.roadmapId,
        userId: roadmap.userId,
        supabaseUserId: user.id,
        completedVideos: completedVideos,
        completedTopics: completedTopics
      };

      console.log('Saving progress data:', updatedData);

      // Save progress using API
      const response = await fetch('/api/roadmaps/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error saving progress. Status:', response.status, 'Data:', data);
        toast.error("Failed to save progress", {
          description: data.message || "There was an error saving your progress"
        });
        return;
      }

      if (data.success) {
        console.log('Progress saved successfully');
        toast.success("Progress saved", {
          description: "Your learning progress has been updated"
        });

        // Update local roadmap with the latest data from the server
        if (data.roadmap) {
          setRoadmap({
            ...roadmap,
            completedVideos: data.roadmap.completedVideos || [],
            topics: data.roadmap.topics || roadmap.topics
          });
        }
      } else {
        console.error('Failed to save progress:', data.message);
        toast.error("Failed to save progress", {
          description: data.message || "An error occurred while saving progress"
        });
      }
    } catch (error) {
      console.error('Error in saveProgress function:', error);
      toast.error("Failed to save progress", {
        description: "There was an error connecting to the server"
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, roadmap, completedVideos, completedTopics]);

  // Save progress when user completes a video or topic
  useEffect(() => {
    if (completedVideos.length > 0) {
      const timeoutId = setTimeout(() => {
        saveProgress();
      }, 2000); // Debounce to avoid too many API calls

      return () => clearTimeout(timeoutId);
    }
  }, [completedVideos, saveProgress]);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  // Mark video as completed
  const markVideoAsCompleted = (videoUrl: string) => {
    if (!completedVideos.includes(videoUrl)) {
      setCompletedVideos(prev => [...prev, videoUrl]);
    }
  };

  // Check if a video is completed
  const isVideoCompleted = (videoUrl: string) => {
    return completedVideos.includes(videoUrl);
  };

  const navigateToPreviousTopic = () => {
    if (!roadmap) return;

    // If we're not on the first query of the current topic, go to previous query
    if (activeQueryIndex > 0) {
      const newQueryIndex = activeQueryIndex - 1;
      setActiveQueryIndex(newQueryIndex);

      // Set video for this query
      const topic = roadmap.topics[activeTopicIndex];
      if (topic.links && topic.links[newQueryIndex] && topic.links[newQueryIndex].length > 0) {
        setActiveVideoUrl(topic.links[newQueryIndex][0]);
      } else {
        setActiveVideoUrl(null);
      }
      return;
    }

    // If we're on the first query but not the first topic, go to previous topic's last query
    if (activeTopicIndex > 0) {
      const newTopicIndex = activeTopicIndex - 1;
      const newTopic = roadmap.topics[newTopicIndex];
      setActiveTopicIndex(newTopicIndex);

      // Go to last query of previous topic
      const lastQueryIndex = newTopic.queries.length - 1;
      setActiveQueryIndex(lastQueryIndex > 0 ? lastQueryIndex : 0);

      setExpandedTopics([newTopic._id]);

      // Set video for this query
      if (newTopic.links && newTopic.links[lastQueryIndex] && newTopic.links[lastQueryIndex].length > 0) {
        setActiveVideoUrl(newTopic.links[lastQueryIndex][0]);
      } else {
        setActiveVideoUrl(null);
      }
    }
  };

  const navigateToNextTopic = () => {
    if (!roadmap) return;

    const currentTopic = roadmap.topics[activeTopicIndex];

    // Mark current video as completed when navigating to next
    if (activeVideoUrl) {
      markVideoAsCompleted(activeVideoUrl);
    }

    // If we're not on the last query of the current topic, go to next query
    if (activeQueryIndex < currentTopic.queries.length - 1) {
      const newQueryIndex = activeQueryIndex + 1;
      setActiveQueryIndex(newQueryIndex);

      // Set video for this query
      if (currentTopic.links && currentTopic.links[newQueryIndex] && currentTopic.links[newQueryIndex].length > 0) {
        setActiveVideoUrl(currentTopic.links[newQueryIndex][0]);
      } else {
        setActiveVideoUrl(null);
      }
      return;
    }

    // If we're on the last query and not the last topic, mark current topic as complete and go to next topic
    if (activeTopicIndex < roadmap.topics.length - 1) {
      // Mark current topic as complete
      if (!completedTopics.includes(currentTopic._id)) {
        setCompletedTopics(prev => [...prev, currentTopic._id]);
      }

      const newTopicIndex = activeTopicIndex + 1;
      const newTopic = roadmap.topics[newTopicIndex];
      setActiveTopicIndex(newTopicIndex);
      setActiveQueryIndex(0); // Start with first query of next topic

      setExpandedTopics([newTopic._id]);

      // Set first video of the next topic
      if (newTopic.links && newTopic.links[0] && newTopic.links[0].length > 0) {
        setActiveVideoUrl(newTopic.links[0][0]);
      } else {
        setActiveVideoUrl(null);
      }
    }
  };

  const fetchTranscript = async () => {
    if (!activeVideoUrl) return;

    try {
      setIsLoading(true);
      console.log("Video URL:", activeVideoUrl);

      // Step 1: Fetch the transcript from your backend using the video URL
      const transcriptResponse = await axios.post("/api/transcript", { videoUrl: activeVideoUrl });
      console.log("Transcript Response dadasd:", transcriptResponse.data);

      const transcript = transcriptResponse.data.transcript;
      console.log("Transcript Extracted:vsdasd", transcript);

      if (!transcript) {
        console.error("No transcript received from backend.");
        return;
      }

      // Step 2: Send the transcript to Gemini for note generation
      const notesResponse = await axios.post("/api/generateNotes", { transcript });
      console.log("Notes lalal Response:", notesResponse.data);
      

      if (notesResponse.data.error) {
        setnotes("Error generating notes.");
      } else {
        setnotes(notesResponse.data.notes || "Notes generation failed.");
      }

    } catch (error) {
      console.error("Error during fetchTranscript execution:", error);
      setnotes("Error: Failed to process video and generate notes.");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = () => {
    if (!editableNotes) {
      alert("No transcript available to generate PDF.");
      return;
    }

    const doc = new jsPDF();
    const lines: string[] = editableNotes.split("\n");

    let yPosition = 10;
    const lineHeight = 10;

    lines.forEach((line: string) => {   // ✅ Added type annotation for TypeScript compatibility
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 10;
      }
      doc.text(line, 10, yPosition);
      yPosition += lineHeight;
    });

    doc.save("transcript.pdf");
  };



  function cleanTranscript(text: string): string {
    // Split the text into lines
    const lines = text.split('\n');

    // Remove the first line
    lines.shift();

    // Remove all asterisks and trim each line
    const cleanedLines = lines.map(line => line.replace(/\*/g, '').trim());

    // Join the cleaned lines back into a single text block
    return cleanedLines.join('\n');
  }




  return (
    <AliveScope>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{ roadmap?.title || 'Roadmap View' }</h1>

          {/* Show progress information */ }
          { roadmap && (
            <div className="ml-auto flex items-center gap-2">
              <div className="text-sm text-muted-foreground mr-2">
                { completedVideos.length } / { roadmap.topics.reduce((total, topic) => {
                  return total + topic.links.reduce((sum, linkGroup) => sum + linkGroup.length, 0);
                }, 0) } videos completed
              </div>
              <Progress value={ progress } className="w-24 h-2" />
              <span className="text-sm font-medium">{ progress }%</span>
            </div>
          ) }
        </div>

        { isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    { Array(3).fill(0).map((_, i) => (
                      <Skeleton key={ i } className="h-10 w-full" />
                    )) }
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="aspect-video w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : roadmap ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Topics Navigation Sidebar */ }
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Topics</CardTitle>
                  <CardDescription>
                    { roadmap.description }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    { roadmap.topics.map((topic, index) => (
                      <Collapsible
                        key={ topic._id || index }
                        open={ expandedTopics.includes(topic._id) }
                        onOpenChange={ () => toggleTopic(topic._id) }
                        className={ `border rounded-md overflow-hidden ${activeTopicIndex === index ? 'border-primary' : ''} ${completedTopics.includes(topic._id) ? 'bg-muted/50' : ''}` }
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
                          <div className="flex items-center">
                            <span className={ `${activeTopicIndex === index ? 'bg-primary' : completedTopics.includes(topic._id) ? 'bg-green-500' : 'bg-muted'} text-primary-foreground w-6 h-6 flex items-center justify-center rounded-full text-xs mr-3` }>
                              { completedTopics.includes(topic._id) ?
                                <CheckCircle className="h-3 w-3" /> :
                                topic.day
                              }
                            </span>
                            <span className="font-medium">{ topic.name }</span>
                          </div>
                          { expandedTopics.includes(topic._id) ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          ) }
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-t px-3 py-2 bg-muted/20">
                          <ul className="space-y-2 pl-9">
                            { topic.queries.map((query, queryIndex) => (
                              <li key={ queryIndex } className="text-sm">
                                <Button
                                  variant={ index === activeTopicIndex && queryIndex === activeQueryIndex ? "default" : "ghost" }
                                  className="text-left justify-start h-auto py-1 px-2 w-full"
                                  onClick={ () => {
                                    setActiveTopicIndex(index);
                                    setActiveQueryIndex(queryIndex);
                                    // Set first video of this query as active
                                    if (topic.links && topic.links[queryIndex] &&
                                      topic.links[queryIndex].length > 0) {
                                      setActiveVideoUrl(topic.links[queryIndex][0]);
                                    } else {
                                      setActiveVideoUrl(null);
                                    }
                                  } }
                                >
                                  <span className="truncate">{ query }</span>
                                  {/* Show if all videos for this query are completed */ }
                                  { topic.links[queryIndex] &&
                                    topic.links[queryIndex].length > 0 &&
                                    topic.links[queryIndex].every(link => completedVideos.includes(link)) && (
                                      <Check className="h-3 w-3 ml-2 text-green-500" />
                                    ) }
                                </Button>
                              </li>
                            )) }
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    )) }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Area */ }
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    { roadmap.topics[activeTopicIndex]?.name || "Select a Topic" }
                  </CardTitle>
                  <CardDescription>
                    { roadmap.topics[activeTopicIndex]?.queries[activeQueryIndex] || "Select a query to study" }
                  </CardDescription>
                </CardHeader>

                <Tabs value={ tabValue } onValueChange={ handleTabChange } className="px-6">
                  <TabsList>
                    <TabsTrigger value="video">Video</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="transcript">Notes</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                  </TabsList>

                  <TabsContent value="video" className="space-y-4">
                    { activeVideoUrl ? (
                      <div className="aspect-video overflow-hidden rounded-lg mt-2">
                        <iframe
                          className="w-full h-full"
                          src={ getEmbedUrl(activeVideoUrl || '') }
                          title="YouTube video player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mt-2">
                        <div className="text-center p-4">
                          <Video className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Select a topic to watch videos</p>
                        </div>
                      </div>
                    ) }

                    {/* Video Controls */ }
                    { activeVideoUrl && (
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          { isVideoCompleted(activeVideoUrl) ?
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Completed
                            </span> :
                            "Watching..."
                          }
                        </div>
                        <Button
                          size="sm"
                          onClick={ () => setShowQuiz(true) }
                          disabled={ isVideoCompleted(activeVideoUrl) }
                        >
                          Mark as Completed
                        </Button>

                        <QuizModal
                          open={ showQuiz }
                          onClose={ () => setShowQuiz(false) }
                          onSubmit={ () => {
                            markVideoAsCompleted(activeVideoUrl);
                          } }
                          videoUrl={ activeVideoUrl } // Pass the quiz data based on the active video URL
                        />


                      </div>
                    ) }

                    {/* Video List */ }
                    { roadmap.topics[activeTopicIndex] && (
                      <div className="pt-4 border-t">
                        <h3 className="text-sm font-semibold mb-3">Available Videos</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          { roadmap.topics[activeTopicIndex].links[activeQueryIndex]?.map((link, linkIndex) => (
                            <Button
                              key={ linkIndex }
                              variant={ activeVideoUrl === link ? "default" : isVideoCompleted(link) ? "outline" : "outline" }
                              className={ `justify-start h-auto py-2 px-3 ${isVideoCompleted(link) ? 'border-green-500' : ''}` }
                              onClick={ () => setActiveVideoUrl(link) }
                            >
                              { isVideoCompleted(link) ? (
                                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 text-green-500" />
                              ) : (
                                <Video className="h-4 w-4 mr-2 flex-shrink-0" />
                              ) }
                              <span className="truncate">Video { linkIndex + 1 }</span>
                            </Button>
                          )) }
                        </div>
                        { (!roadmap.topics[activeTopicIndex].links[activeQueryIndex] ||
                          roadmap.topics[activeTopicIndex].links[activeQueryIndex].length === 0) && (
                            <div className="text-center py-6">
                              <p className="text-muted-foreground">No videos available for this query</p>
                            </div>
                          ) }
                      </div>
                    ) }
                  </TabsContent>

                  <TabsContent value="chat" forceMount={ true }>
                    { tabValue === 'chat' && (
                      <KeepAlive name="Chat">
                        <Chat activeVideoUrl={ activeVideoUrl ?? "" } editableNotes={ editableNotes ?? "" } />
                      </KeepAlive>
                    ) }
                  </TabsContent>


                  <TabsContent value="resources">
                    <div className="py-4">
                      <div className="rounded-lg border p-4">
                        <h3 className="font-medium text-lg mb-2 flex items-center">
                          <Bookmark className="h-5 w-5 mr-2" />
                          Related Resources
                        </h3>

                        <div className="space-y-3 mt-4">
                          <div className="p-3 bg-muted/40 rounded-md">
                            <h4 className="font-medium">Documentation</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Official documentation and guides for this topic
                            </p>
                            <Button variant="link" className="px-0 h-auto py-1">
                              View Documentation
                            </Button>
                          </div>

                          <div className="p-3 bg-muted/40 rounded-md">
                            <h4 className="font-medium">Articles</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Blog posts, tutorials and community resources
                            </p>
                            <Button variant="link" className="px-0 h-auto py-1">
                              View Articles
                            </Button>
                          </div>

                          <div className="p-3 bg-muted/40 rounded-md">
                            <h4 className="font-medium">Practice Exercises</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Hands-on exercises to practice your skills
                            </p>
                            <Button variant="link" className="px-0 h-auto py-1">
                              View Exercises
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="transcript">
                    <div className="py-4">
                      <div className="rounded-lg border p-4">
                        <h3 className="font-medium text-lg mb-2 flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Transcript & Notes
                        </h3>

                        <div className="mt-4 space-y-4">
                          <div>
                            <Button
                              size="sm"
                              onClick={ fetchTranscript }
                              disabled={ isLoading || !activeVideoUrl }
                            >
                              { isLoading ? "Fetching Transcript & Notes..." : "Fetch Transcript & Notes" }
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-2"
                              onClick={ generatePDF }
                              disabled={ !notes }
                            >
                              <Download className="h-4 w-4 mr-1" /> Download Notes as PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-2"
                              onClick={ toggleEdit }
                            >
                              { isEditable ? (
                                <>
                                  <Save className="h-4 w-4 mr-1" /> Save Notes
                                </>
                              ) : (
                                <>
                                  <Edit className="h-4 w-4 mr-1" /> Edit Notes
                                </>
                              ) }
                            </Button>
                          </div>

                          <textarea
                            className="w-full min-h-[300px] p-3 mt-4 rounded-md border resize-y"
                            placeholder="Notes generated from the transcript will appear here..."
                            value={ editableNotes } // Now controlled by state
                            onChange={ handleNotesChange }
                            readOnly={ !isEditable }
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                {/* Navigation Buttons */ }
                <div className="flex justify-between px-6 py-4 border-t">
                  <Button
                    variant="outline"
                    onClick={ navigateToPreviousTopic }
                    disabled={ activeTopicIndex === 0 && activeQueryIndex === 0 }
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  <Button
                    onClick={ navigateToNextTopic }
                    disabled={ !roadmap || (activeTopicIndex >= roadmap.topics.length - 1 &&
                      activeQueryIndex >= roadmap.topics[activeTopicIndex]?.queries.length - 1) }
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="h-96 flex items-center justify-center">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Roadmap Not Found</h3>
              <p className="text-muted-foreground mb-6">
                The requested roadmap could not be found
              </p>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) }

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-sm">
            Progress: { progress || 0 }%
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={ () => router.push(`/dashboard/roadmap/${params.id}/visualization`) }
          >
            <Map className="mr-2 h-4 w-4" />
            Visual Map
          </Button>
          <Button onClick={ () => router.back() } variant="outline" size="sm">
            Back
          </Button>
        </div>
      </div>
    </AliveScope>
  )
} 