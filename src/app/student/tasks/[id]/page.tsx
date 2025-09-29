import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TaskView } from '@/components/student/TaskView'

interface TaskPageProps {
  params: {
    id: string
  }
}

export default async function TaskPage({ params }: TaskPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/teacher')
  }

  // Fetch the task assignment
  const assignment = await prisma.taskAssignment.findFirst({
    where: {
      taskId: params.id,
      studentId: session.user.id
    },
    include: {
      task: {
        include: {
          class: true,
          material: true
        }
      }
    }
  })

  if (!assignment) {
    redirect('/student')
  }

  return <TaskView assignment={assignment} />
}
