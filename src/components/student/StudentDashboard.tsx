'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  PlayCircle,
  Target,
  TrendingUp,
  Calendar,
  Brain,
  FileText,
  Users
} from 'lucide-react'

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
    class: {
      name: string
      grade: string
    }
    material: {
      title: string
      type: string
    } | null
  }
}

interface StudentDashboardProps {
  assignments: TaskAssignment[]
  stats: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    avgProgress: number
  }
}

export function StudentDashboard({ assignments, stats }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [filter, setFilter] = useState('all')

  const filteredAssignments = assignments.filter(assignment => {
    if (activeTab === 'all') return true
    if (activeTab === 'reading') return assignment.task.kind === 'READING'
    if (activeTab === 'homework') return assignment.task.kind === 'HOMEWORK'
    if (activeTab === 'completed') return assignment.status === 'COMPLETED'
    if (activeTab === 'in-progress') return assignment.status === 'IN_PROGRESS'
    return true
  })

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

  const formatTimeRemaining = (dueAt: Date | null) => {
    if (!dueAt) return 'No due date'
    
    const now = new Date()
    const diff = dueAt.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return 'Overdue'
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    return `Due in ${days} days`
  }

  const isOverdue = (dueAt: Date | null) => {
    if (!dueAt) return false
    return new Date() > dueAt
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-600">Track your learning progress</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center">
                <TrendingUp className="mr-1 h-3 w-3" />
                {stats.avgProgress}% Complete
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                Assigned to you
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                Tasks finished
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <PlayCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</div>
              <p className="text-xs text-muted-foreground">
                Currently working on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProgress}%</div>
              <p className="text-xs text-muted-foreground">
                Overall completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment) => (
                <Card 
                  key={assignment.id} 
                  className={`hover:shadow-lg transition-shadow ${
                    isOverdue(assignment.task.dueAt) ? 'border-red-200 bg-red-50' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{assignment.task.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {assignment.task.class.name} • Grade {assignment.task.class.grade}
                        </CardDescription>
                      </div>
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
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{assignment.progress}%</span>
                      </div>
                      <Progress value={assignment.progress} className="h-2" />
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {assignment.task.etcMinutes} min
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatTimeRemaining(assignment.task.dueAt)}
                      </div>
                    </div>

                    {assignment.task.material && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="mr-1 h-3 w-3" />
                        {assignment.task.material.title}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {assignment.task.kind === 'READING' ? (
                          <div className="flex items-center">
                            <BookOpen className="mr-1 h-3 w-3" />
                            Reading
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Target className="mr-1 h-3 w-3" />
                            Homework
                          </div>
                        )}
                      </Badge>
                      
                      <Link href={`/student/tasks/${assignment.task.id}`}>
                        <Button size="sm" variant="outline">
                          {assignment.status === 'NOT_STARTED' ? 'Start' : 'Continue'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredAssignments.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                    <p className="text-gray-600">
                      {activeTab === 'all' 
                        ? "You don't have any assignments yet. Check back soon!"
                        : `No ${activeTab.replace('-', ' ')} tasks found.`
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
