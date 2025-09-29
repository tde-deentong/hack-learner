'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, BookOpen, Target, CheckCircle, PlayCircle, Calendar, FileText, Brain } from 'lucide-react'
import { ReadingView } from './ReadingView'
import { HomeworkView } from './HomeworkView'

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

interface TaskViewProps {
  assignment: TaskAssignment
}

export function TaskView({ assignment }: TaskViewProps) {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<'overview' | 'reading' | 'homework'>('overview')
  const [timeRemaining, setTimeRemaining] = useState(assignment.task.etcMinutes)

  useEffect(() => {
    // Auto-route based on task kind
    if (assignment.task.kind === 'READING') {
      setCurrentView('reading')
    } else if (assignment.task.kind === 'HOMEWORK') {
      setCurrentView('homework')
    }
  }, [assignment.task.kind])

  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'IN_PROGRESS': return <PlayCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleStartTask = async () => {
    // Update assignment status to IN_PROGRESS
    try {
      await fetch(`/api/assignments/${assignment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'IN_PROGRESS',
          startedAt: new Date().toISOString()
        })
      })
      
      // Refresh the page to update the status
      router.refresh()
    } catch (error) {
      console.error('Failed to start task:', error)
    }
  }

  const handleCompleteTask = async () => {
    // Update assignment status to COMPLETED
    try {
      await fetch(`/api/assignments/${assignment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date().toISOString()
        })
      })
      
      // Redirect back to dashboard
      router.push('/student')
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  if (currentView === 'reading') {
    return (
      <ReadingView 
        assignment={assignment}
        onBack={() => setCurrentView('overview')}
        onComplete={handleCompleteTask}
      />
    )
  }

  if (currentView === 'homework') {
    return (
      <HomeworkView 
        assignment={assignment}
        onBack={() => setCurrentView('overview')}
        onComplete={handleCompleteTask}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/student">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{assignment.task.title}</h1>
                <p className="text-sm text-gray-600">
                  {assignment.task.class.name} • Grade {assignment.task.class.grade}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge 
                variant="outline" 
                className={`${getStatusColor(assignment.status)} border-0`}
              >
                <div className="flex items-center">
                  {getStatusIcon(assignment.status)}
                  <span className="ml-1 capitalize">
                    {assignment.status.replace('_', ' ').toLowerCase()}
                  </span>
                </div>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Task Overview */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{assignment.task.title}</CardTitle>
                  {assignment.task.description && (
                    <p className="text-gray-600 mt-2">{assignment.task.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="flex items-center">
                  {assignment.task.kind === 'READING' ? (
                    <>
                      <BookOpen className="mr-1 h-3 w-3" />
                      Reading
                    </>
                  ) : (
                    <>
                      <Target className="mr-1 h-3 w-3" />
                      Homework
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Progress Section */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Progress</span>
                  <span className="text-sm text-gray-600">{assignment.progress}%</span>
                </div>
                <Progress value={assignment.progress} className="h-3" />
              </div>

              {/* Task Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Estimated Time</p>
                    <p className="text-sm text-gray-600">{assignment.task.etcMinutes} minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-gray-600">
                      {assignment.task.dueAt 
                        ? new Date(assignment.task.dueAt).toLocaleDateString()
                        : 'No due date'
                      }
                    </p>
                  </div>
                </div>

                {assignment.task.material && (
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Material</p>
                      <p className="text-sm text-gray-600">{assignment.task.material.title}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {assignment.status === 'NOT_STARTED' && (
                  <Button onClick={handleStartTask} className="flex-1">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start Task
                  </Button>
                )}
                
                {assignment.status === 'IN_PROGRESS' && (
                  <Button 
                    onClick={() => setCurrentView(assignment.task.kind.toLowerCase() as 'reading' | 'homework')}
                    className="flex-1"
                  >
                    Continue Task
                  </Button>
                )}
                
                {assignment.status === 'COMPLETED' && (
                  <Button variant="outline" disabled className="flex-1">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Completed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Breakdown Preview */}
          {assignment.task.breakdown && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  AI Study Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700">
                    This task has been analyzed by AI to help you learn more effectively. 
                    The study guide will be available when you start the task.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
