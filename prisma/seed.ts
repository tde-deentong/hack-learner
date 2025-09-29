import { PrismaClient, Role, GradeLevel, TaskKind, TaskStatus, MaterialType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      name: 'Ms. Johnson',
      password: await bcrypt.hash('password123', 12),
      role: Role.TEACHER,
    },
  })

  // Create students
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: {
      email: 'student1@example.com',
      name: 'Alex Smith',
      password: await bcrypt.hash('password123', 12),
      role: Role.STUDENT,
    },
  })

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: {
      email: 'student2@example.com',
      name: 'Emma Davis',
      password: await bcrypt.hash('password123', 12),
      role: Role.STUDENT,
    },
  })

  // Create a class
  const class1 = await prisma.class.create({
    data: {
      name: 'Science Grade 5',
      grade: GradeLevel.G5,
      teacherId: teacher.id,
    },
  })

  // Add students to class
  await prisma.classMember.createMany({
    data: [
      { classId: class1.id, userId: student1.id },
      { classId: class1.id, userId: student2.id },
    ],
  })

  // Create materials
  const readingMaterial = await prisma.material.create({
    data: {
      title: 'The Solar System',
      type: MaterialType.PDF_READING,
      fileUrl: 'https://example.com/solar-system.pdf',
      fileKey: 'solar-system.pdf',
      wordCount: 1200,
      ownerId: teacher.id,
      meta: {
        pageCount: 5,
        gradeLevel: 'G5',
        subject: 'Science'
      }
    },
  })

  const homeworkMaterial = await prisma.material.create({
    data: {
      title: 'Solar System Quiz',
      type: MaterialType.PDF_HOMEWORK,
      fileUrl: 'https://example.com/solar-system-quiz.pdf',
      fileKey: 'solar-system-quiz.pdf',
      wordCount: 800,
      ownerId: teacher.id,
      meta: {
        pageCount: 3,
        gradeLevel: 'G5',
        subject: 'Science',
        questionCount: 5
      }
    },
  })

  // Create tasks
  const readingTask = await prisma.task.create({
    data: {
      classId: class1.id,
      materialId: readingMaterial.id,
      kind: TaskKind.READING,
      title: 'Read about the Solar System',
      description: 'Learn about the planets and their characteristics',
      grade: GradeLevel.G5,
      etcMinutes: 15,
      breakdown: {
        chunks: [
          {
            heading: 'Introduction to the Solar System',
            chunkText: 'Our solar system consists of eight planets orbiting around a central star called the Sun. The Sun is a massive ball of hot gas that provides light and heat to all the planets.',
            estMinutes: 3,
            wordCount: 45
          },
          {
            heading: 'The Inner Planets',
            chunkText: 'The four inner planets are Mercury, Venus, Earth, and Mars. These planets are rocky and are closest to the Sun. Earth is the only planet known to support life.',
            estMinutes: 4,
            wordCount: 50
          },
          {
            heading: 'The Outer Planets',
            chunkText: 'The four outer planets are Jupiter, Saturn, Uranus, and Neptune. These are gas giants with thick atmospheres. Jupiter is the largest planet in our solar system.',
            estMinutes: 4,
            wordCount: 48
          },
          {
            heading: 'Dwarf Planets and Other Objects',
            chunkText: 'Beyond Neptune, there are dwarf planets like Pluto, and many other objects like asteroids and comets that orbit the Sun.',
            estMinutes: 4,
            wordCount: 35
          }
        ]
      }
    },
  })

  const homeworkTask = await prisma.task.create({
    data: {
      classId: class1.id,
      materialId: homeworkMaterial.id,
      kind: TaskKind.HOMEWORK,
      title: 'Solar System Quiz',
      description: 'Complete the quiz about the solar system',
      grade: GradeLevel.G5,
      etcMinutes: 20,
      breakdown: {
        questions: [
          {
            index: 1,
            prompt: 'What is the name of our star?',
            difficulty: 'easy',
            estMinutes: 2
          },
          {
            index: 2,
            prompt: 'List the four inner planets in order from the Sun.',
            difficulty: 'medium',
            estMinutes: 5
          },
          {
            index: 3,
            prompt: 'Which planet is known as the Red Planet?',
            difficulty: 'easy',
            estMinutes: 2
          },
          {
            index: 4,
            prompt: 'Explain why Earth is the only planet that supports life.',
            difficulty: 'hard',
            estMinutes: 8
          },
          {
            index: 5,
            prompt: 'What are the four outer planets called?',
            difficulty: 'medium',
            estMinutes: 3
          }
      }
    },
  })

  // Create task assignments
  await prisma.taskAssignment.createMany({
    data: [
      {
        taskId: readingTask.id,
        studentId: student1.id,
        status: TaskStatus.NOT_STARTED,
        progress: 0,
      },
      {
        taskId: readingTask.id,
        studentId: student2.id,
        status: TaskStatus.IN_PROGRESS,
        progress: 25,
        startedAt: new Date(),
      },
      {
        taskId: homeworkTask.id,
        studentId: student1.id,
        status: TaskStatus.NOT_STARTED,
        progress: 0,
      },
      {
        taskId: homeworkTask.id,
        studentId: student2.id,
        status: TaskStatus.IN_PROGRESS,
        progress: 40,
        startedAt: new Date(),
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
  console.log('👨‍🏫 Teacher: teacher@example.com / password123')
  console.log('👨‍🎓 Student 1: student1@example.com / password123')
  console.log('👩‍🎓 Student 2: student2@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
