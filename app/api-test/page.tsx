'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'

export default function GeminiTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['JavaScript', 'React'])
  const [timeCommitment, setTimeCommitment] = useState<string>('2 weeks')

  const skills = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'react', label: 'React' },
    { id: 'node', label: 'Node.js' },
    { id: 'python', label: 'Python' },
    { id: 'machine-learning', label: 'Machine Learning' },
  ]

  const timeOptions = [
    { id: '1-week', label: '1 week' },
    { id: '2-weeks', label: '2 weeks' },
    { id: '1-month', label: '1 month' },
    { id: '3-months', label: '3 months' },
  ]

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prevSkills =>
      prevSkills.includes(skill)
        ? prevSkills.filter(s => s !== skill)
        : [...prevSkills, skill]
    )
  }

  const testGeminiConfig = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/mock/gemini')
      const data = await response.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const testGeminiMockAPI = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/mock/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: selectedSkills,
          timeCommitment,
        }),
      })
      const data = await response.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const testGeminiDirect = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/generate-learning-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: selectedSkills,
          timeCommitment,
        }),
      })
      const data = await response.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Gemini API Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Check if Gemini API is properly configured
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={testGeminiConfig} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Gemini Config'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Skills</CardTitle>
            <CardDescription>Select skills for your learning path</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={skill.id} 
                    checked={selectedSkills.includes(skill.label)}
                    onCheckedChange={() => toggleSkill(skill.label)}
                  />
                  <label htmlFor={skill.id} className="text-sm font-medium">
                    {skill.label}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium">Time Commitment</h3>
              <div className="grid grid-cols-2 gap-4">
                {timeOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={option.id} 
                      checked={timeCommitment === option.label}
                      onCheckedChange={() => setTimeCommitment(option.label)}
                    />
                    <label htmlFor={option.id} className="text-sm font-medium">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={testGeminiMockAPI} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Mock...
                </>
              ) : (
                'Test Mock API'
              )}
            </Button>
            <Button onClick={testGeminiDirect} disabled={isLoading} variant="outline">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Real API'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {error && (
        <Card className="mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-destructive">{error}</pre>
          </CardContent>
        </Card>
      )}
      
      {response && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap max-h-[500px] overflow-auto rounded-md bg-muted p-4 text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 