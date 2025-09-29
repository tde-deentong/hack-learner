import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, progress, startedAt, completedAt } = await request.json()

    // Verify the assignment belongs to the current user
    const assignment = await prisma.taskAssignment.findFirst({
      where: {
        id: params.id,
        studentId: session.user.id
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Update the assignment
    const updatedAssignment = await prisma.taskAssignment.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
        ...(startedAt && { startedAt: new Date(startedAt) }),
        ...(completedAt && { completedAt: new Date(completedAt) })
      }
    })

    return NextResponse.json(updatedAssignment)
  } catch (error) {
    console.error('Assignment update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
