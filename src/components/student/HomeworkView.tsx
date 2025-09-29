'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Target, Lightbulb } from 'lucide-react'
import { HomeworkQuestion } from '@/lib/homework'

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

interface HomeworkViewProps {
  assignment: TaskAssignment
  onBack: () => void
  onComplete: () => void
}

export function HomeworkView({ assignment, onBack, onComplete }: HomeworkViewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questions, setQuestions] = useState<HomeworkQuestion[]>([])
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set())
  const [showHints, setShowHints] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load homework questions from task breakdown
    if (assignment.task.breakdown?.questions) {
      setQuestions(assignment.task.breakdown.questions)
    } else {
      // Fallback: create sample questions
      setQuestions([
        {
          index: 1,
          prompt: "What is the main idea of this passage?",
          difficulty: 'medium',
          estMinutes: 5
        },
        {
          index: 2,
          prompt: "Explain the relationship between the two concepts discussed.",
          difficulty: 'hard',
          estMinutes: 8
        },
        {
          index: 3,
          prompt: "List three key points from the reading.",
          difficulty: 'easy',
          estMinutes: 3
        }
      ])
    }
    setIsLoading(false)
  }, [assignment.task.breakdown])

  const handleQuestionComplete = (questionIndex: number, completed: boolean) => {
    const newCompleted = new Set(completedQuestions)
    if (completed) {
      newCompleted.add(questionIndex)
    } else {
      newCompleted.delete(questionIndex)
    }
    setCompletedQuestions(newCompleted)
    updateProgress()
  }

  const updateProgress = async () => {
    const newProgress = Math.round((completedQuestions.size / questions.length) * 100)
    
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

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleComplete = () => {
    updateProgress()
    onComplete()
  }

  const toggleHint = (questionIndex: number) => {
    const newHints = new Set(showHints)
    if (newHints.has(questionIndex)) {
      newHints.delete(questionIndex)
    } else {
      newHints.add(questionIndex)
    }
    setShowHints(newHints)
  }

  const calculateTimeRemaining = () => {
    const remainingQuestions = questions.slice(currentQuestion)
    return remainingQuestions.reduce((total, question) => total + question.estMinutes, 0)
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homework questions...</p>
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
                <p className="text-sm text-gray-600">Homework Task</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">Question {currentQuestion + 1} of {questions.length}</p>
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
              <span>{Math.round((completedQuestions.size / questions.length) * 100)}%</span>
            </div>
            <Progress 
              value={(completedQuestions.size / questions.length) * 100} 
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
                      <Target className="mr-2 h-5 w-5" />
                      Question {currentQuestion + 1}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={getDifficultyColor(questions[currentQuestion]?.difficulty)}
                      >
                        {questions[currentQuestion]?.difficulty || 'medium'}
                      </Badge>
                      <Badge variant="outline">
                        {questions[currentQuestion]?.estMinutes || 0} min
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Question */}
                  <div className="prose max-w-none">
                    <div className="text-lg leading-relaxed">
                      {questions[currentQuestion]?.prompt || 'No question available'}
                    </div>
                  </div>
                  
                  {/* Hint Toggle */}
                  <div className="border-t pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleHint(currentQuestion)}
                      className="flex items-center"
                    >
                      <Lightbulb className="mr-2 h-4 w-4" />
                      {showHints.has(currentQuestion) ? 'Hide Hint' : 'Need a Hint?'}
                    </Button>
                    
                    {showHints.has(currentQuestion) && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          💡 Hint: Take your time to think about what you know about this topic. 
                          Consider the main concepts and how they might relate to each other.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Completion Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`question-${currentQuestion}`}
                      checked={completedQuestions.has(currentQuestion)}
                      onCheckedChange={(checked) => 
                        handleQuestionComplete(currentQuestion, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={`question-${currentQuestion}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Mark this question as completed
                    </label>
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestion === 0}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    
                    {currentQuestion === questions.length - 1 ? (
                      <Button 
                        onClick={handleComplete} 
                        className="bg-green-600 hover:bg-green-700"
                        disabled={completedQuestions.size !== questions.length}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Homework
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion}>
                        Next Question
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
                  <CardTitle className="text-lg">Homework Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Questions Completed</span>
                      <span>{completedQuestions.size} / {questions.length}</span>
                    </div>
                    <Progress 
                      value={(completedQuestions.size / questions.length) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Time Remaining</span>
                      <span>{calculateTimeRemaining()} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question Navigation */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Question List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {questions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`w-full text-left p-2 rounded-lg border transition-colors ${
                          index === currentQuestion
                            ? 'bg-blue-100 border-blue-300'
                            : completedQuestions.has(index)
                            ? 'bg-green-100 border-green-300'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Q{index + 1}</span>
                          {completedQuestions.has(index) && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {question.estMinutes} min • {question.difficulty}
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
