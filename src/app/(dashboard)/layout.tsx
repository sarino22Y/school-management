import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SessionProvider } from "@/components/providers/session-provider"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return (
    <SessionProvider session={session}>
      <DashboardLayout user={session.user}>
        {children}
      </DashboardLayout>
    </SessionProvider>
  )
}