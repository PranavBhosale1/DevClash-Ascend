"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from 'lucide-react'

interface StreamlitEmbedProps {
  title?: string
  description?: string
  height?: string | number
}

export default function StreamlitEmbed({
  title = "Ascend Flow Learning Path Generator",
  description = "Interactive learning path generation powered by Streamlit",
  height = 800
}: StreamlitEmbedProps) {
  const [isStreamlitRunning, setIsStreamlitRunning] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const streamlitUrl = "http://localhost:8501?embed=true"

  // Check if Streamlit is running
  useEffect(() => {
    const checkStreamlitStatus = async () => {
      try {
        const response = await fetch(streamlitUrl, { method: 'HEAD', mode: 'no-cors' })
        // Since we're using no-cors, we can't actually check the status
        // We'll assume it's running if the fetch doesn't throw an error
        setIsStreamlitRunning(true)
      } catch (error) {
        setIsStreamlitRunning(false)
      }
    }

    checkStreamlitStatus()
    const interval = setInterval(checkStreamlitStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleOpenInNewTab = () => {
    window.open(streamlitUrl.replace('?embed=true', ''), '_blank')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenInNewTab}
            className="flex items-center gap-1"
          >
            <ExternalLink size={16} />
            <span>Open in new tab</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isStreamlitRunning ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-muted rounded-md">
            <h3 className="text-lg font-semibold mb-2">Streamlit App Not Running</h3>
            <p className="text-muted-foreground mb-4">
              The Streamlit app doesn't appear to be running. To use this feature, you need to start the Streamlit server.
            </p>
            <div className="bg-card p-4 rounded-md text-left w-full max-w-2xl">
              <p className="text-sm font-semibold mb-2">Run these commands in your terminal:</p>
              <div className="bg-black text-white p-3 rounded-md font-mono text-xs">
                <div>cd ascend/streamlit-app</div>
                <div>streamlit run app.py</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {showInstructions && (
              <div className="bg-muted p-4 rounded-md mb-4">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground">
                    This is an embedded Streamlit app that provides interactive learning path generation. 
                    You can create personalized learning paths and visualize progress statistics.
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowInstructions(false)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
            <div className="w-full rounded-md overflow-hidden border">
              <iframe
                src={streamlitUrl}
                height={height}
                style={{ width: '100%', border: 'none' }}
                title="Ascend Flow Streamlit App"
                allow="camera;microphone"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 