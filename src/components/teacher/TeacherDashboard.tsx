'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  FileText,
  Calendar,
  Target,
  Brain
} from 'lucide-react'

interface Class {
  id: string
  name: string
  grade: string
  members: Array<{
    user: {
      id: string
      name: string
      email: string
    }
  }>
  tasks: Array<{
    id: string
    title: string
    kind: string
    dueAt: Date | null
    assignments: Array<{
      status: string
      progress: number
    }>
  }>
}

interface Material {
  id: string
  title: string
  type: string
  wordCount: number | null
  createdAt: Date
}

interface TeacherDashboardProps {
  classes: Class[]
  recentMaterials: Material[]
}

export function TeacherDashboard({ classes, recentMaterials }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const totalStudents = classes.reduce((sum, cls) => sum + cls.members.length, 0)
  const totalTasks = classes.reduce((sum, cls) => sum + cls.tasks.length, 0)
  
  // Calculate average progress across all tasks
  const allAssignments = classes.flatMap(cls => 
    cls.tasks.flatMap(task => task.assignments)
  )
  const avgProgress = allAssignments.length > 0 
    ? Math.round(allAssignments.reduce((sum, assignment) => sum + assignment.progress, 0) / allAssignments.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-gray-600">Manage your classes and assignments</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/teacher/materials/new">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Material
                </Button>
              </Link>
              <Link href="/teacher/tasks/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classes.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active classes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Enrolled students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    Created tasks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgProgress}%</div>
                  <p className="text-xs text-muted-foreground">
                    Student progress
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Classes</CardTitle>
                  <CardDescription>Your most recent class activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {classes.slice(0, 3).map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{cls.name}</h4>
                          <p className="text-sm text-gray-600">
                            {cls.members.length} students • Grade {cls.grade}
                          </p>
                        </div>
                        <Link href={`/teacher/classes/${cls.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    ))}
                    {classes.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No classes yet. Create your first class!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Materials</CardTitle>
                  <CardDescription>Your uploaded learning materials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentMaterials.slice(0, 3).map((material) => (
                      <div key={material.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{material.title}</h4>
                          <p className="text-sm text-gray-600">
                            {material.type} • {material.wordCount ? `${material.wordCount} words` : 'No word count'}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {material.type === 'PDF_READING' ? 'Reading' : 'Homework'}
                        </Badge>
                      </div>
                    ))}
                    {recentMaterials.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No materials yet. Upload your first material!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Classes</h2>
              <Link href="/teacher/classes/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Class
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{cls.name}</CardTitle>
                    <CardDescription>
                      Grade {cls.grade} • {cls.members.length} students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Active Tasks:</span>
                        <span>{cls.tasks.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg Progress:</span>
                        <span>
                          {cls.tasks.length > 0 
                            ? Math.round(
                                cls.tasks.reduce((sum, task) => 
                                  sum + (task.assignments.reduce((s, a) => s + a.progress, 0) / task.assignments.length || 0), 0
                                ) / cls.tasks.length
                              )
                            : 0}%
                        </span>
                      </div>
                      <Link href={`/teacher/classes/${cls.id}`}>
                        <Button className="w-full">Manage Class</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {classes.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No classes yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first class to start managing students and assignments.
                    </p>
                    <Link href="/teacher/classes/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Class
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Learning Materials</h2>
              <Link href="/teacher/materials/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Material
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {material.title}
                      <Badge variant={material.type === 'PDF_READING' ? 'default' : 'secondary'}>
                        {material.type === 'PDF_READING' ? 'Reading' : 'Homework'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {material.wordCount ? `${material.wordCount} words` : 'No word count available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Created:</span>
                      <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {recentMaterials.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No materials yet</h3>
                    <p className="text-gray-600 mb-4">
                      Upload your first learning material to start creating assignments.
                    </p>
                    <Link href="/teacher/materials/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Your First Material
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Class Performance</CardTitle>
                  <CardDescription>Average progress by class</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {classes.map((cls) => {
                      const avgProgress = cls.tasks.length > 0 
                        ? Math.round(
                            cls.tasks.reduce((sum, task) => 
                              sum + (task.assignments.reduce((s, a) => s + a.progress, 0) / task.assignments.length || 0), 0
                            ) / cls.tasks.length
                          )
                        : 0
                      
                      return (
                        <div key={cls.id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{cls.name}</span>
                            <span className="text-sm text-gray-600">{avgProgress}%</span>
                          </div>
                          <Progress value={avgProgress} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Task Completion</CardTitle>
                  <CardDescription>Completion rates by task type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Reading Tasks</span>
                      <span className="text-sm text-gray-600">
                        {allAssignments.filter(a => a.status === 'COMPLETED').length} / {allAssignments.length}
                      </span>
                    </div>
                    <Progress 
                      value={allAssignments.length > 0 ? (allAssignments.filter(a => a.status === 'COMPLETED').length / allAssignments.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
