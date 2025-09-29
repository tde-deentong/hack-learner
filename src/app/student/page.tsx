import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StudentDashboard } from '@/components/student/StudentDashboard'

export default async function StudentPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/teacher')
  }

  // Fetch student's task assignments
  const assignments = await prisma.taskAssignment.findMany({
    where: { studentId: session.user.id },
    include: {
      task: {
        include: {
          class: true,
          material: true
        }
      }
    },
    orderBy: { task: { dueAt: 'asc' } }
  })

  // Calculate stats
  const totalTasks = assignments.length
  const completedTasks = assignments.filter(a => a.status === 'COMPLETED').length
  const inProgressTasks = assignments.filter(a => a.status === 'IN_PROGRESS').length
  const avgProgress = assignments.length > 0 
    ? Math.round(assignments.reduce((sum, a) => sum + a.progress, 0) / assignments.length)
    : 0

  return (
    <StudentDashboard 
      assignments={assignments}
      stats={{
        totalTasks,
        completedTasks,
        inProgressTasks,
        avgProgress
      }}
    />
  )
}
