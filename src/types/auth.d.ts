import type { DefaultSession, DefaultUser } from "next-auth"
import type { JWT as DefaultJWT } from "@auth/core/jwt"

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string
    role: "ADMIN" | "TEACHER"
    firstName: string
    lastName: string
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name: string
      role: "ADMIN" | "TEACHER"
      firstName: string
      lastName: string
    } & DefaultSession["user"]
  }
}

declare module "@auth/core/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: "ADMIN" | "TEACHER"
    firstName: string
    lastName: string
  }
}