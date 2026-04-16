"use client"

import { useSession } from "next-auth/react"
import { hasPermission } from "@/lib/permissions"

type UserRole = "ADMIN" | "TEACHER"

export function usePermissions() {
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined

  return {
    role,
    isAdmin: role === "ADMIN",
    isTeacher: role === "TEACHER",
    can: (permission: Parameters<typeof hasPermission>[1]) => {
      if (!role) return false
      return hasPermission(role, permission)
    }
  }
}