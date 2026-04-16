import { SessionProvider } from "@/components/providers/session-provider"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)
  
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