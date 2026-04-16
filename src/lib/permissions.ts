import { UserRole } from "@prisma/client"

export const PERMISSIONS = {
  ADMIN: {
    canManageUsers: true,
    canManageStudents: true,
    canManageClasses: true,
    canManageSubjects: true,
    canManageTeachers: true,
    canViewAllGrades: true,
    canEditAllGrades: true,
    canClosePeriod: true,
    canUnlockPeriod: true,
    canGenerateReports: true,
    canAccessSettings: true
  },
  TEACHER: {
    canManageUsers: false,
    canManageStudents: false,
    canManageClasses: false,
    canManageSubjects: false,
    canManageTeachers: false,
    canViewAllGrades: false,
    canEditAllGrades: false,
    canEditOwnGrades: true,
    canViewOwnGrades: true,
    canClosePeriod: false,
    canUnlockPeriod: false,
    canGenerateReports: false,
    canAccessSettings: false
  }
} as const

export function hasPermission(
  role: UserRole,
  permission: keyof typeof PERMISSIONS.ADMIN
) {
  return PERMISSIONS[role][permission] || false
}