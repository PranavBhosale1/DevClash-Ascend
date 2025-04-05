"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Brain, Code, Sparkles, Target, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LearningTimer } from "@/components/learning-timer"

export default function Home() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + i * 0.1,
        duration: 0.5,
      },
    }),
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Ascend Flow
          </motion.h1>
        
          <motion.nav
            className="ml-auto flex gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link href="/register" className="text-sm font-medium hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Register
            </Link>
          </motion.nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6">
            <motion.div
              className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="flex flex-col justify-center space-y-4" variants={itemVariants}>
                <div className="space-y-2">
                  <motion.div
                    className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Introducing Ascend Flow
                  </motion.div>
                  <motion.h2
                    className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                    variants={itemVariants}
                  >
                    Learn Smarter, <span className="text-primary">Not Harder</span>
                  </motion.h2>
                  <motion.p
                    className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                    variants={itemVariants}
                  >
                    Ascend Flow helps you learn more effectively with AI-recommended content, smart backlog management,
                    and a clean gamified interface.
                  </motion.p>
                </div>
                <motion.div className="flex flex-col gap-2 min-[400px]:flex-row" variants={itemVariants}>
                  <Link href="/register">
                    <Button size="lg" className="gap-1 group">
                      Get Started
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div className="flex items-center justify-center" variants={itemVariants}>
                <motion.div
                  className="relative h-[450px] w-full max-w-[450px] rounded-lg overflow-hidden"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-sm rounded-lg"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full p-6">
                      {/* Animated dashboard mockup */}
                      <motion.div
                        className="absolute top-6 left-6 right-6 h-12 bg-background rounded-t-lg border border-border flex items-center px-4"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <div className="ml-4 text-sm font-medium">Ascend Flow Dashboard</div>
                      </motion.div>

                      <motion.div
                        className="absolute top-[72px] left-6 right-6 bottom-6 bg-background rounded-b-lg border border-t-0 border-border p-4 overflow-hidden"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <motion.div
                          className="w-full h-8 mb-4 flex items-center"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          <div className="text-sm font-bold">Hello, Learner!</div>
                          <div className="ml-auto w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                        </motion.div>

                        <motion.div
                          className="w-full h-6 mb-2 flex justify-between items-center"
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          <div className="text-xs">Learning Progress</div>
                          <div className="text-xs font-medium">68%</div>
                        </motion.div>

                        <motion.div
                          className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden"
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: 1, opacity: 1 }}
                          transition={{ delay: 0.9 }}
                        >
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "68%" }}
                            transition={{ delay: 1, duration: 1 }}
                          ></motion.div>
                        </motion.div>

                        <motion.div
                          className="grid grid-cols-2 gap-3"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1.1 }}
                        >
                          <motion.div
                            className="h-24 rounded-lg border bg-card p-3 flex flex-col"
                            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                          >
                            <div className="text-xs font-medium mb-2">Next.js Fundamentals</div>
                            <div className="mt-auto flex justify-between items-center">
                              <div className="text-xs text-muted-foreground">12 lessons</div>
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <Code className="h-3 w-3 text-primary" />
                              </div>
                            </div>
                          </motion.div>

                          <motion.div
                            className="h-24 rounded-lg border bg-card p-3 flex flex-col"
                            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                          >
                            <div className="text-xs font-medium mb-2">AI Fundamentals</div>
                            <div className="mt-auto flex justify-between items-center">
                              <div className="text-xs text-muted-foreground">8 lessons</div>
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <Brain className="h-3 w-3 text-primary" />
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                  Supercharge Your Learning
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover how Ascend Flow transforms your learning experience
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
              {[
                {
                  icon: <BookOpen className="h-10 w-10 text-primary" />,
                  title: "Smart Backlog",
                  description: "Organize your learning materials intelligently based on your goals and schedule.",
                },
                {
                  icon: <Target className="h-10 w-10 text-primary" />,
                  title: "Gamified Experience",
                  description: "Stay motivated with progress tracking, achievements, and learning streaks.",
                },
                {
                  icon: <Sparkles className="h-10 w-10 text-primary" />,
                  title: "AI Recommendations",
                  description: "Get personalized content suggestions based on your learning style and goals.",
                },
                {
                  icon: <Code className="h-10 w-10 text-primary" />,
                  title: "Web Scraping",
                  description: "Access curated learning resources from across the web in one place.",
                },
                {
                  icon: <Users className="h-10 w-10 text-primary" />,
                  title: "Community Learning",
                  description: "Connect with peers and learn together through shared resources and discussions.",
                },
                {
                  icon: <Brain className="h-10 w-10 text-primary" />,
                  title: "Custom Roadmaps",
                  description:
                    "Follow personalized learning paths tailored to your experience level and time commitment.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col items-center space-y-4 rounded-lg border p-6 transition-all hover:shadow-md"
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={featureVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-center text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-1 group">
                  Start Your Learning Journey
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Learning?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Join thousands of learners who have accelerated their skills with Ascend Flow's intelligent learning
                  platform.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="gap-1 group">
                    Get Started for Free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button size="lg" variant="outline">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Ascend Flow. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm font-medium hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm font-medium hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

