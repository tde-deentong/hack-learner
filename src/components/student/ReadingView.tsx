'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Volume2, VolumeX } from 'lucide-react'
import { ReadingChunk } from '@/lib/reading'

interface TaskAssignment {
  id: string
  status: string
  progress: number
  startedAt: Date | null
  completedAt: Date | null
  task: {
    id: string
    title: string
    description: string | null
    kind: string
    dueAt: Date | null
    etcMinutes: number
    breakdown: any
    class: {
      name: string
      grade: string
    }
    material: {
      title: string
      type: string
      fileUrl: string
    } | null
  }
}

interface ReadingViewProps {
  assignment: TaskAssignment
  onBack: () => void
  onComplete: () => void
}

export function ReadingView({ assignment, onBack, onComplete }: ReadingViewProps) {
  const [currentChunk, setCurrentChunk] = useState(0)
  const [chunks, setChunks] = useState<ReadingChunk[]>([])
  const [isTextToSpeech, setIsTextToSpeech] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load reading chunks from task breakdown
    if (assignment.task.breakdown?.chunks) {
      setChunks(assignment.task.breakdown.chunks)
    } else {
      // Fallback: create basic chunks from material
      // This would typically be done server-side
      setChunks([
        {
          chunkText: "This is a sample reading chunk. In a real implementation, this would be generated from the uploaded PDF material.",
          estMinutes: 3,
          wordCount: 25
        }
      ])
    }
    setIsLoading(false)
  }, [assignment.task.breakdown])

  const handleNextChunk = () => {
    if (currentChunk < chunks.length - 1) {
      setCurrentChunk(currentChunk + 1)
      updateProgress()
    }
  }

  const handlePreviousChunk = () => {
    if (currentChunk > 0) {
      setCurrentChunk(currentChunk - 1)
    }
  }

  const updateProgress = async () => {
    const newProgress = Math.round(((currentChunk + 1) / chunks.length) * 100)
    
    try {
      await fetch(`/api/assignments/${assignment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          progress: newProgress,
          status: newProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS'
        })
      })
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const handleComplete = () => {
    updateProgress()
    onComplete()
  }

  const toggleTextToSpeech = () => {
    if (isTextToSpeech) {
      speechSynthesis.cancel()
    } else {
      const utterance = new SpeechSynthesisUtterance(chunks[currentChunk]?.chunkText || '')
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
    setIsTextToSpeech(!isTextToSpeech)
  }

  const calculateTimeRemaining = () => {
    const remainingChunks = chunks.slice(currentChunk + 1)
    return remainingChunks.reduce((total, chunk) => total + chunk.estMinutes, 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reading material...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">{assignment.task.title}</h1>
                <p className="text-sm text-gray-600">Reading Task</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">Chunk {currentChunk + 1} of {chunks.length}</p>
                <p className="text-xs text-gray-600">
                  {calculateTimeRemaining()} min remaining
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(((currentChunk + 1) / chunks.length) * 100)}%</span>
            </div>
            <Progress 
              value={((currentChunk + 1) / chunks.length) * 100} 
              className="h-2" 
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Reading Chunk {currentChunk + 1}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTextToSpeech}
                      >
                        {isTextToSpeech ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Badge variant="outline">
                        {chunks[currentChunk]?.estMinutes || 0} min
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="text-lg leading-relaxed">
                      {chunks[currentChunk]?.chunkText || 'No content available'}
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={handlePreviousChunk}
                      disabled={currentChunk === 0}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    
                    {currentChunk === chunks.length - 1 ? (
                      <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Reading
                      </Button>
                    ) : (
                      <Button onClick={handleNextChunk}>
                        Next Chunk
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reading Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Chunks Completed</span>
                      <span>{currentChunk + 1} / {chunks.length}</span>
                    </div>
                    <Progress 
                      value={((currentChunk + 1) / chunks.length) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Time Remaining</span>
                      <span>{calculateTimeRemaining()} min</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Words in Current Chunk</span>
                      <span>{chunks[currentChunk]?.wordCount || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chunk Navigation */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Chunk List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {chunks.map((chunk, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentChunk(index)}
                        className={`w-full text-left p-2 rounded-lg border transition-colors ${
                          index === currentChunk
                            ? 'bg-blue-100 border-blue-300'
                            : index < currentChunk
                            ? 'bg-green-100 border-green-300'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Chunk {index + 1}</span>
                          {index < currentChunk && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {chunk.estMinutes} min • {chunk.wordCount} words
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
