"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface DashboardLayoutProps {
    children: React.ReactNode
    user: {
        id: string
        email: string
        name: string
        role: "ADMIN" | "TEACHER"
        firstName: string
        lastName: string
    }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger className="lg:hidden fixed top-4 left-4 z-50">
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    <Sidebar user={user} mobile />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-40">
                <Sidebar user={user} />
            </div>

            {/* Main Content */}
            <div className="lg:ml-72 min-h-screen flex flex-col">
                <Header user={user} />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}