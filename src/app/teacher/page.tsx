import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard'

export default async function TeacherPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/student')
  }

  // Fetch teacher's classes and recent tasks
  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    include: {
      members: {
        include: {
          user: true
        }
      },
      tasks: {
        include: {
          assignments: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  const recentMaterials = await prisma.material.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <TeacherDashboard 
      classes={classes}
      recentMaterials={recentMaterials}
    />
  )
}
