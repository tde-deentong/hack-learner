import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { getServerSession } from 'next-auth'
import { prisma } from './prisma'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        // For demo purposes, we'll use a simple password check
        // In production, you'd hash passwords properly
        const isValid = await bcrypt.compare(credentials.password, user.password || '')
        
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as Role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export function requireAuth(role?: Role) {
  return async function handler(req: any, res: any, next: any) {
    const user = await getCurrentUser()
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    if (role && user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    
    return next()
  }
}
