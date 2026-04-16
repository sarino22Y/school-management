import { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"
import { z } from "zod"
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

// ============================================
// TYPES ÉTENDUS - Syntaxe correcte pour v5
// ============================================

declare module "next-auth" {
  interface User {
    id: string
    role: "ADMIN" | "TEACHER"
    firstName: string
    lastName: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: "ADMIN" | "TEACHER"
      firstName: string
      lastName: string
    }
  }
}

// JWT est maintenant dans @auth/core, pas next-auth/jwt
declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: "ADMIN" | "TEACHER"
    firstName: string
    lastName: string
  }
}

// ============================================
// CONFIGURATION
// ============================================

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase().trim() }
        })

        if (!user || user.status !== "ACTIVE") return null

        const isValid = await compare(parsed.data.password, user.password)
        if (!isValid) return null

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    
    async session({ session, token }) {
      // Type guard pour éviter 'unknown'
      if (token && typeof token.id === 'string') {
        session.user.id = token.id
        session.user.role = token.role as "ADMIN" | "TEACHER"
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
      }
      return session
    },
    
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname === "/login"
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")

      if (isApiAuthRoute) return true
      
      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
        return true
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl))
      }

      // RBAC avec type guard
      const user = auth.user
      if (!user || typeof user.role !== 'string') {
        return Response.redirect(new URL("/login", nextUrl))
      }

      const adminOnlyRoutes = ["/settings", "/users", "/school-years", "/subjects"]
      const isAdminOnly = adminOnlyRoutes.some(route => nextUrl.pathname.startsWith(route))
      
      if (isAdminOnly && user.role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    }
  },
  
  pages: {
    signIn: "/login",
    error: "/login"
  },
  
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60
  }
}