// File: src/pages/api/auth/[...nextauth].ts
import NextAuth, { DefaultUser, AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '@/lib/db'
import User, { IUser } from '@/models/User'

// Extend the built-in session types
declare module "next-auth" {
  interface User extends DefaultUser {
    role: string;
  }

  interface Session {
    user: User & {
      id: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials', 
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect()
      
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password')
        }
      
        const user = await User.findOne({ email: credentials.email })
      
        if (!user) {
          throw new Error('No user found with this email')
        }
      
        const isPasswordMatch = await user.comparePassword(credentials.password)
      
        if (!isPasswordMatch) {
          throw new Error('Invalid password')
        }
      
        return { 
          id: user._id.toString(), 
          email: user.email, 
          name: user.name, 
          role: user.role 
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.sub as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}

export default NextAuth(authOptions)