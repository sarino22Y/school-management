"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  School,
  FileText,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

interface SidebarProps {
  user: any
  mobile?: boolean
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER"] },
  { name: "Élèves", href: "/students", icon: Users, roles: ["ADMIN", "TEACHER"] },
  { name: "Notes", href: "/grades", icon: FileText, roles: ["ADMIN", "TEACHER"] },
  { name: "Classes", href: "/classes", icon: School, roles: ["ADMIN"] },
  { name: "Matières", href: "/subjects", icon: BookOpen, roles: ["ADMIN"] },
  { name: "Enseignants", href: "/teachers", icon: GraduationCap, roles: ["ADMIN"] },
  { name: "Périodes", href: "/periods", icon: Calendar, roles: ["ADMIN"] },
  { name: "Paramètres", href: "/settings", icon: Settings, roles: ["ADMIN"] },
]

export function Sidebar({ user, mobile }: SidebarProps) {
  const pathname = usePathname()
  const { role } = usePermissions()

  const filteredNav = navigation.filter(item => 
    item.roles.includes(role || "")
  )

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">Gestion École</h1>
        <p className="text-sm text-slate-500 mt-1">{user.firstName} {user.lastName}</p>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
          {role === "ADMIN" ? "Administrateur" : "Enseignant"}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-700"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}