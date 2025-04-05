"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, ChevronRight, ChevronLeft, Loader2, Check, BookOpen, Clock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { generateLearningPath } from "@/lib/gemini"
import { useRouter } from 'next/navigation'

export function RoadmapCreator() {
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [learningGoal, setLearningGoal] = useState("")
  const [experience, setExperience] = useState("beginner")
  const [timeCommitment, setTimeCommitment] = useState(5) // hours per week

  const totalSteps = 3

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to create a roadmap")
      return
    }

    setIsSubmitting(true)

    try {
      // Enhanced validation
      if (!learningGoal || learningGoal.trim() === "") {
        throw new Error("Please specify what you want to learn")
      }

      if (learningGoal.trim().length < 3) {
        throw new Error("Learning goal is too short")
      }

      // Get Supabase user ID
      const supabaseUserId = user.id;
      console.log("Using Supabase user ID:", supabaseUserId);
      
      // Prepare roadmap data with enhanced title generation
      const generatedTitle = title || `Learn ${learningGoal.split(" ").slice(0, 4).join(" ")}`
      const roadmapData = {
        user_id: supabaseUserId,
        title: generatedTitle,
        learning_goal: learningGoal.trim(),
        experience_level: experience,
        time_commitment: timeCommitment,
      }

      console.log("Creating roadmap with data:", roadmapData)
      
      // Create roadmap in Supabase with better error handling
      const { data, error } = await supabase
        .from('roadmaps')
        .insert([roadmapData])
        .select()
      
      if (error) {
        console.error("Supabase insert error:", error)
        if (error.code === "23505") {
          throw new Error("You already have a roadmap with this title")
        } else if (error.code?.startsWith("23")) {
          throw new Error("Database constraint error - please try again")
        } else if (error.code === "42501") {
          throw new Error("Permission denied - you may not have access to create roadmaps")
        } else {
          throw new Error(`Database error: ${error.message || "Unknown database error"}`)
        }
      }
      
      if (!data || data.length === 0) {
        console.error("No data returned from database insert")
        throw new Error("Failed to create roadmap: No data returned")
      }
      
      const newRoadmapId = data[0].id
      console.log("Roadmap created successfully:", data[0])
      
      // Proceed to generate learning path using Gemini AI
      setIsGenerating(true)
      try {
        const timeCommitmentString = timeCommitment <= 3 ? "1-week" : timeCommitment >= 8 ? "3-months" : "1-month"
        
        // Call Gemini API to generate learning path
        console.log(`Generating learning path for ${learningGoal} with commitment ${timeCommitmentString}`)
        
        // Pass the Supabase user ID to the generateLearningPath function
        const learningPathResult = await generateLearningPath(
          learningGoal,
          timeCommitmentString,
          supabaseUserId,  // Pass Supabase user ID here
          newRoadmapId
        );
        
        console.log("Learning path generated:", learningPathResult)
        
        setIsComplete(true)
        toast.success("Roadmap created successfully!")
      } catch (aiError: any) {
        console.error("Error generating learning path:", aiError)
        // Show partial success message if roadmap was created but content generation failed
        setIsComplete(true)
        toast("Roadmap created, but content generation encountered an issue", {
          description: "Your roadmap was saved but we couldn't generate content. Please try again later.",
          action: {
            label: "Retry",
            onClick: () => window.location.reload()
          }
        })
      } finally {
        setIsGenerating(false)
      }
      
      // Reset form
      setTitle("")
      setLearningGoal("")
      setExperience("beginner")
      setTimeCommitment(5)
      
      // Reset after showing success
      setTimeout(() => {
        setIsOpen(false)
        setCurrentStep(0)
        setIsComplete(false)
        router.refresh()
      }, 2000)
    } catch (error: any) {
      console.error("Error creating roadmap:", error)
      const errorMessage = error.message || "An unexpected error occurred"
      toast.error(`Failed to create roadmap: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative mx-auto w-full max-w-md rounded-lg border bg-card p-6 shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Close button */}
              <button
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                <span className="sr-only">Close</span>
              </button>

              {/* Progress indicator */}
              <div className="mb-6 flex items-center justify-between">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                        currentStep > index
                          ? "border-primary bg-primary text-primary-foreground"
                          : currentStep === index
                            ? "border-primary text-primary"
                            : "border-muted text-muted-foreground",
                      )}
                    >
                      {currentStep > index ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    {index < totalSteps - 1 && (
                      <div className={cn("h-1 w-10", currentStep > index ? "bg-primary" : "bg-muted")} />
                    )}
                  </div>
                ))}
              </div>

              <div className="min-h-[320px]">
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div
                      key="complete"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center justify-center space-y-4 py-12"
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold">Roadmap Created!</h3>
                      <p className="text-center text-muted-foreground">
                        Your personalized learning roadmap has been created. Check your dashboard to start learning.
                      </p>
                    </motion.div>
                  ) : isSubmitting ? (
                    <motion.div
                      key="submitting"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center justify-center space-y-4 py-12"
                    >
                      <div className="relative h-20 w-20">
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary/10"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold">Creating Your Roadmap</h3>
                      <p className="text-center text-muted-foreground">
                        We're analyzing your goals and crafting the perfect learning path...
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      {currentStep === 0 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold">What do you want to learn?</h2>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Tell us what skills or topics you're interested in learning. Be as specific as possible.
                          </p>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="roadmap-title">Roadmap Title (Optional)</Label>
                              <Input
                                id="roadmap-title"
                                placeholder="e.g., Web Development Path, ML Journey, etc."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="learning-goal">Learning Goal</Label>
                              <Textarea
                                id="learning-goal"
                                placeholder="e.g., Web development with React and Next.js, Machine Learning fundamentals, etc."
                                value={learningGoal}
                                onChange={(e) => setLearningGoal(e.target.value)}
                                className="min-h-[120px]"
                                required
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {currentStep === 1 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center space-x-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold">What's your experience level?</h2>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            This helps us tailor the content to your current knowledge and skills.
                          </p>
                          <RadioGroup value={experience} onValueChange={setExperience} className="space-y-3">
                            <div className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50">
                              <RadioGroupItem value="beginner" id="beginner" />
                              <Label htmlFor="beginner" className="flex-1 cursor-pointer font-medium">
                                Beginner
                                <p className="font-normal text-sm text-muted-foreground">
                                  Little to no experience in this area
                                </p>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50">
                              <RadioGroupItem value="intermediate" id="intermediate" />
                              <Label htmlFor="intermediate" className="flex-1 cursor-pointer font-medium">
                                Intermediate
                                <p className="font-normal text-sm text-muted-foreground">
                                  Some experience, but looking to improve
                                </p>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50">
                              <RadioGroupItem value="advanced" id="advanced" />
                              <Label htmlFor="advanced" className="flex-1 cursor-pointer font-medium">
                                Advanced
                                <p className="font-normal text-sm text-muted-foreground">
                                  Significant experience, seeking to master
                                </p>
                              </Label>
                            </div>
                          </RadioGroup>
                        </motion.div>
                      )}

                      {currentStep === 2 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold">How much time can you commit?</h2>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            This helps us create a realistic roadmap that fits your schedule.
                          </p>
                          <div className="space-y-6 pt-2">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label>Hours per week: {timeCommitment}</Label>
                              </div>
                              <Slider
                                value={[timeCommitment]}
                                min={1}
                                max={20}
                                step={1}
                                onValueChange={(value) => setTimeCommitment(value[0])}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>1 hour</span>
                                <span>10 hours</span>
                                <span>20 hours</span>
                              </div>
                            </div>

                            <div className="rounded-md border p-4">
                              <h3 className="font-medium">Your commitment level:</h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {timeCommitment < 5
                                  ? "Casual learning - perfect for building habits and steady progress."
                                  : timeCommitment < 10
                                    ? "Dedicated learning - you'll make consistent progress on your goals."
                                    : "Intensive learning - you're serious about rapid skill development!"}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </AnimatePresence>
              </div>

              {!isSubmitting && !isComplete && (
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={cn(currentStep === 0 && "opacity-0")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={currentStep === 0 && learningGoal.trim() === ""}
                  >
                    {currentStep === totalSteps - 1 ? "Create Roadmap" : "Next"}
                    {currentStep === totalSteps - 1 ? (
                      <Sparkles className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

