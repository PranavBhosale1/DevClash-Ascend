"use client"

import { Loader2, BookOpen, Sparkles, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function Loading() {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    animate: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Creating Your Learning Path</h1>
        <motion.p 
          className="text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          We're crafting a personalized roadmap for your learning journey...
        </motion.p>
      </div>

      <div className="flex flex-col items-center justify-center py-16">
        <motion.div 
          className="flex flex-col items-center gap-6 mb-12"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="relative"
            variants={itemVariants}
          >
            <motion.div 
              className="h-24 w-24 rounded-full bg-primary/10"
              variants={pulseVariants}
              animate="animate"
            />
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              variants={iconVariants}
              animate="animate"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </motion.div>
          </motion.div>
          
          <motion.h2 
            className="text-xl font-semibold text-center"
            variants={itemVariants}
          >
            Generating AI-powered learning path
          </motion.h2>
          
          <motion.p 
            className="text-center text-muted-foreground max-w-md"
            variants={itemVariants}
          >
            Our AI is analyzing your inputs and creating a tailored roadmap to help you achieve your learning goals efficiently.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            className="flex flex-col items-center p-6 rounded-lg border bg-card text-card-foreground shadow"
            variants={itemVariants}
          >
            <motion.div 
              className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
              variants={iconVariants}
              animate="animate"
            >
              <BookOpen className="h-6 w-6 text-primary" />
            </motion.div>
            <h3 className="font-medium">Curating resources</h3>
            <motion.div 
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "60%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-6 rounded-lg border bg-card text-card-foreground shadow"
            variants={itemVariants}
          >
            <motion.div 
              className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
              variants={iconVariants}
              animate="animate"
            >
              <Sparkles className="h-6 w-6 text-primary" />
            </motion.div>
            <h3 className="font-medium">Optimizing structure</h3>
            <motion.div 
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "40%" }}
                transition={{ duration: 3.5, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-6 rounded-lg border bg-card text-card-foreground shadow"
            variants={itemVariants}
          >
            <motion.div 
              className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
              variants={iconVariants}
              animate="animate"
            >
              <ArrowRight className="h-6 w-6 text-primary" />
            </motion.div>
            <h3 className="font-medium">Finalizing path</h3>
            <motion.div 
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "20%" }}
                transition={{ duration: 4, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

