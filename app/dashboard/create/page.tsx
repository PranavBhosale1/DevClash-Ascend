"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BookOpen, Clock, Sparkles, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { generateLearningPath } from "@/lib/gemini"


// Popular skills that users might want to learn
const popularSkills = [
  { id: "web-dev", name: "Web Development", icon: "💻" },
  { id: "data-science", name: "Data Science", icon: "📊" },
  { id: "machine-learning", name: "Machine Learning", icon: "🤖" },
  { id: "mobile-dev", name: "Mobile Development", icon: "📱" },
  { id: "design", name: "UI/UX Design", icon: "🎨" },
  { id: "blockchain", name: "Blockchain", icon: "⛓️" },
]

// Time commitment options
const timeCommitments = [
  { value: "1-week", label: "1 Week", description: "Quick introduction to the basics" },
  { value: "1-month", label: "1 Month", description: "Comprehensive overview with projects" },
  { value: "3-months", label: "3 Months", description: "Deep dive with advanced concepts" },
]

export default function CreateLearningPathPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [skill, setSkill] = useState("")
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [timeCommitment, setTimeCommitment] = useState("1-month")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1);
  const [relatedSkill, setRelatedSkill] = useState('');
  const [creator, setCreator] = useState('');
  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [customHour, setCustomHour] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileProcessed, setFileProcessed] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [syllabusResponse, setSyllabusResponse] = useState<string>("");
  const [syllabusError, setSyllabusError] = useState<string>("");




  const handleSampleClick = (hour: number) => {
    setSelectedHour(hour);
    setCustomHour(hour.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {  // Allow only integers
      setCustomHour(value);
      setSelectedHour(value ? parseInt(value, 10) : null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      // Reset states
      setFileProcessed(false);
      setFileContent("");
    }
  };

  const processPdfSyllabus = async (file: File): Promise<string> => {
    try {
      console.log("Starting file processing...");
      
      if (!file || file.size === 0) {
        throw new Error("❌ No file selected or file is empty.");
      }
      
      // Create FormData to send the file
      const formData = new FormData();
      formData.append("file", file);
      
      console.log("Sending request to Next.js API route...");
      
      // Call the Next.js API endpoint
      const response = await fetch('/api/process-syllabus', {
        method: 'POST',
        body: formData
      });
      
      console.log("Response status:", response.status);
      
      // Read the response as text first to debug
      const rawResponseText = await response.text();
      console.log("Raw response text:", rawResponseText);
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(rawResponseText);
        console.log("Parsed response data:", data);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        return `File uploaded: ${file.name}. Could not process the file content.`;
      }
      
      // Handle error responses that contain fallback summaries
      if (!response.ok) {
        if (data?.fallbackSummary) {
          console.warn("Using fallback summary from error response");
          return data.fallbackSummary;
        }
        throw new Error(`Server responded with status: ${response.status}, message: ${data?.error || 'Unknown error'}`);
      }
      
      // Handle the response data
      if (data.success && data.summary) {
        return data.summary;
      } else if (data.summary) {
        return data.summary;
      } else {
        console.warn("Response did not contain expected data format:", data);
        return `File processed: ${file.name}. No detailed summary available.`;
      }
    } catch (error: any) {
      console.error('Error processing PDF syllabus:', error);
      // Return a usable string instead of throwing to prevent the UI from breaking
      return `File: ${file.name}. Processing error: ${error.message}`;
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a PDF or DOCX file to upload",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'pdf' && fileType !== 'docx') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF or DOCX file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB max
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setFileUploading(true);
    setSyllabusError("");
    
    try {
      // Process the file
      const summary = await processPdfSyllabus(selectedFile);
      console.log("Summary received:", summary);
      
      // Check if it's a normal summary or a fallback message
      const isFallback = summary.includes("Processing error:") || 
                        summary.includes("Could not process the file") ||
                        summary.includes("No detailed summary available");
      
      // Set states with the response
      setFileProcessed(true);
      setFileContent(summary);
      setSyllabusResponse(summary);
      
      if (isFallback) {
        // It's a fallback summary
        setSyllabusError("Limited processing was possible for this file");
        toast({
          title: "Limited file processing",
          description: "We couldn't fully analyze your file, but you can still continue with your learning path creation.",
          variant: "warning",
        });
      } else {
        // It's a proper summary
        toast({
          title: "File processed successfully",
          description: "Your syllabus has been analyzed and will be used to customize your learning path",
        });
      }
    } catch (error: any) {
      // This should rarely happen now since processPdfSyllabus returns fallbacks instead of throwing
      console.error("Unexpected error in file upload:", error);
      setSyllabusError(error.message);
      
      const fallbackSummary = `File: ${selectedFile.name}. Could not process automatically.`;
      setFileProcessed(true);
      setFileContent(fallbackSummary);
      setSyllabusResponse(fallbackSummary);
      
      toast({
        title: "File processing issue",
        description: "We couldn't analyze your file, but you can still continue with basic information.",
        variant: "warning",
      });
    } finally {
      setFileUploading(false);
    }
  };

  // Handle popular skill selection
  const handleSkillSelect = (skillId: string) => {
    const selected = popularSkills.find((s) => s.id === skillId)
    if (selected) {
      setSkill(selected.name)
      setSelectedSkill(skillId)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const prompt:string = `Please provide the complete, unabridged response to full ${skill} roadmap . I want this roadmap in the perspective of YouTube search, so give me searches accordingly, 
    Divide the whole plan into days, with ${customHour} hours per day.
    You can break topics as needed—there is no requirement to complete a topic in 30 minutes or one day. If a topic requires more time, allocate it accordingly. If a topic doesn't require 30 minutes, you may reduce its time.Also if you think there is need of practice or revision also add days like that and give me this road map as divided in as may topic as possible Also there is no restriction that you have to genetrate the roadmap ofr only 60 days etc you have open hands give each topic appropriate time .
    Provide the entire response in one go without truncating.
    Also conisder keep in mind that i have already lerned ${relatedSkill} so skip this skill
    ${syllabusResponse ? `I've uploaded a syllabus with the following content summary. Please use this to structure the learning path appropriately:\n\n${syllabusResponse}` : ''}
    **Format:**
    Day: [Day Number]
    total time 40min(this should be near to 120min)
    Topic Name:
    Time allotted: 30 MIN 
    To search: "[Search Query]"
    To search: "[Search Query]"
    To search: "[Search Query]"
    Time allotted: 10 MIN
    To search: "[Search Query]"
    note :- if the topic is like insertion at end insertion at start and insertion at between in a link list then provide me insertion in  alink list as query as this is more appropriate so according to you and your knowledge of youtube provide it `;
    if (!skill.trim()) {
      toast({
        title: "Please enter a skill",
        description: "You need to specify what you want to learn",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a learning path",
        variant: "destructive",
      })
      return
    }


    try {
      console.log("Creating learning path for:", skill)

      // Convert time commitment to hours per week
      let hoursPerWeek = 5 // default
      if (timeCommitment === "1-week") hoursPerWeek = 10
      if (timeCommitment === "3-months") hoursPerWeek = 3

      // Create file name from syllabus if available
      const courseName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : skill;

      // Create roadmap in Supabase
      const { data: roadmapData, error: roadmapError } = await supabase
        .from("roadmaps")
        .insert({
          user_id: user.id,
          title: `Learn ${skill}`,
          learning_goal: skill,
          experience_level: "beginner", // Default to beginner
          time_commitment: hoursPerWeek,
        })
        .select()

      if (roadmapError) {
        console.error("Supabase error creating roadmap:", roadmapError)
        throw new Error(`Database error: ${roadmapError.message}`)
      }

      // Generate learning path using Gemini AI
      const roadmapId = roadmapData?.[0]?.id

      if (!roadmapId) {
        throw new Error("Failed to create roadmap: No roadmap ID returned")
      }

      console.log("Roadmap created with ID:", roadmapId)

      try {
        // Get Supabase user ID
        const supabaseUserId = user.id;
        console.log("Using Supabase user ID:", supabaseUserId);

        const learningPath = await generateLearningPath(
          prompt,
          skill,
          customHour,
          creator,
          supabaseUserId, // Pass Supabase user ID directly
          roadmapId,
          courseName // Pass the course name to the generateLearningPath function
        )

        console.log("Learning path generated successfully:", learningPath.title)

        toast({
          title: "Learning path created!",
          description: "Your personalized learning journey is ready",
        })

        // Redirect to the learning page with the new roadmap
        router.push(`/dashboard/learning?roadmap=${roadmapId}`)
      } catch (geminiError: any) {
        console.error("Error generating learning path with Gemini:", geminiError)

        // We'll still redirect to the roadmap since it was created,
        // but we'll show an error toast
        toast({
          title: "Partial success",
          description: "Your roadmap was created, but we had trouble generating detailed content. You can still view your roadmap.",
          variant: "warning",
        })

        router.push(`/dashboard/learning?roadmap=${roadmapId}`)
      }
    } catch (error: any) {
      console.error("Error in overall learning path creation process:", error)
      toast({
        title: "Error creating learning path",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create Learning Path</h1>
        <p className="text-muted-foreground mt-2">
          Tell us what you want to learn, and we'll create a personalized learning path for you
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        { step === 1 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>What do you want to learn?</CardTitle>
              <CardDescription>Enter a skill or topic you're interested in learning</CardDescription>
            </CardHeader>
            
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="skill">Skill or Topic</Label>
                  <Input
                    id="skill"
                    placeholder="e.g., JavaScript, Machine Learning, Photography"
                    value={ skill }
                    onChange={ (e) => {
                      setSkill(e.target.value)
                      setSelectedSkill(null) // Clear selected skill when typing
                    } }
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Popular Skills</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    { popularSkills.map((popularSkill, index) => (
                      <motion.div
                        key={ popularSkill.id }
                        initial={ { opacity: 0, y: 10 } }
                        animate={ { opacity: 1, y: 0 } }
                        transition={ { delay: 0.05 * index } }
                      >
                        <Button
                          type="button"
                          variant={ selectedSkill === popularSkill.id ? "default" : "outline" }
                          className="justify-start h-auto py-3 w-full"
                          onClick={ () => handleSkillSelect(popularSkill.id) }
                        >
                          <span className="mr-2 text-lg">{ popularSkill.icon }</span>
                          <span>{ popularSkill.name }</span>
                        </Button>
                      </motion.div>
                    )) }
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Time you can devote daily</Label>
                  <div className="flex items-center space-x-2 mb-2">
                    { [1, 3, 5].map((hour) => (
                      <Button
                        key={ hour }
                        type="button"
                        variant={ selectedHour === hour ? "default" : "outline" }
                        onClick={ () => handleSampleClick(hour) }
                      >
                        { hour } hr
                      </Button>
                    )) }
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <motion.div
                      initial={ { opacity: 0, y: 10 } }
                      animate={ { opacity: 1, y: 0 } }
                      transition={ { delay: 0.05 } }
                    >
                      <input
                        type="text"
                        value={ customHour }
                        onChange={ handleInputChange }
                        placeholder="Enter hours"
                        className="w-full p-3 border rounded-md"
                      />
                    </motion.div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <motion.div className="w-full"
                  whileHover={ { scale: 1.02 } }
                  whileTap={ { scale: 0.98 } }
                >
                  <Button className="w-full" onClick={ handleNext } disabled={ !skill.trim() }>Next</Button>
                </motion.div>
              </CardFooter>
            
          </Card>
        ) }
        { step === 2 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Do you have any skill related to this?</Label>
                <Input
                  value={ relatedSkill }
                  onChange={ (e) => setRelatedSkill(e.target.value) }
                  placeholder="e.g., Basic Programming, Photography Basics"
                />
              </div>

              <div>
                <Label>Do you have any creator in mind?</Label>
                <Input
                  value={ creator }
                  onChange={ (e) => setCreator(e.target.value) }
                  placeholder="e.g., freeCodeCamp, Traversy Media"
                />
              </div>

              <div>
                <Label>Upload a syllabus or PDF (optional)</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Input 
                    type="file" 
                    accept=".pdf,.docx" 
                    id="syllabus"
                    className="bg-gray-800/50 border border-gray-700 file:bg-purple-600 file:border-0 file:text-white file:rounded file:px-3 file:py-1 hover:file:bg-purple-700 cursor-pointer"
                    onChange={ handleFileChange }
                    disabled={ fileUploading }
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-purple-500/30 hover:bg-purple-500/10"
                    type="button"
                    onClick={ handleFileUpload }
                    disabled={ fileUploading || !selectedFile }
                  >
                    { fileUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : "Upload" }
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  We'll analyze the content to better customize your learning path
                </p>
                
                {selectedFile && (
                  <div className="mt-2 p-2 rounded-md bg-gray-800/30 border border-gray-700">
                    <div className="text-sm flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-purple-400" />
                      <span className="text-sm">{selectedFile.name}</span>
                      {fileProcessed && !fileUploading && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                          Processed
                        </span>
                      )}
                      {fileUploading && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full flex items-center">
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Processing...
                        </span>
                      )}
                      {syllabusError && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                          Limited
                        </span>
                      )}
                    </div>
                    {fileProcessed && !fileUploading && (
                      <div>
                        <p className="text-xs text-muted-foreground mt-1">
                          This document will be used to customize your learning path
                        </p>
                        {syllabusResponse && (
                          <div className="mt-2 p-2 bg-gray-900/50 rounded-md text-xs max-h-24 overflow-y-auto">
                           
                          </div>
                        )}
                      </div>
                    )}
                    {fileUploading && (
                      <div className="mt-2 p-2 bg-gray-900/50 rounded-md text-xs">
                        <div className="flex flex-col items-center py-2">
                          <Loader2 className="h-6 w-6 animate-spin text-purple-500 mb-2" />
                          <p className="text-gray-300">Processing your file, please wait...</p>
                          <p className="text-gray-400 text-xs mt-1">This may take a moment depending on file size</p>
                        </div>
                      </div>
                    )}
                    {syllabusError && !fileUploading && (
                      <p className="text-xs text-yellow-400 mt-1">
                        {syllabusError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={ handleBack }>Back</Button>
              <form onSubmit={ handleSubmit }>
                <Button
                  type="submit"
                  className="w-fit"
                  size="lg"
                  disabled={ isLoading || !skill.trim() || fileUploading }
                >
                  { isLoading || fileUploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      { isLoading ? "Generating your learning path..." : "Processing file..." }
                    </>
                  ) : (
                    <>
                      Create Learning Path
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) }
                </Button>
              </form>
            </CardFooter>
          </Card>
        ) }


        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                className="flex items-start gap-3"
                initial={ { opacity: 0, y: 10 } }
                animate={ { opacity: 1, y: 0 } }
                transition={ { delay: 0.1 } }
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Choose a skill</h3>
                  <p className="text-sm text-muted-foreground">Tell us what you want to learn</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-3"
                initial={ { opacity: 0, y: 10 } }
                animate={ { opacity: 1, y: 0 } }
                transition={ { delay: 0.2 } }
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Set your timeline</h3>
                  <p className="text-sm text-muted-foreground">Choose how much time you can commit</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-3"
                initial={ { opacity: 0, y: 10 } }
                animate={ { opacity: 1, y: 0 } }
                transition={ { delay: 0.3 } }
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Get your learning path</h3>
                  <p className="text-sm text-muted-foreground">We'll create a personalized plan for you</p>
                </div>
              </motion.div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Learning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-sm">Personalized content recommendations</p>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <p className="text-sm">Curated learning resources</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <p className="text-sm">Optimized for your schedule</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
