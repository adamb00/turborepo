import { auth } from "@workspace/auth"
import { AppSidebar } from "@workspace/ui/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import "@workspace/ui/globals.css"
import { SidebarUser } from "@workspace/ui/types/sidebar-user"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  if (!session || !session.user) {
    return (
      <html lang="en">
        <body className="antialiased">{children}</body>
      </html>
    )
  }

  const sidebarUser: SidebarUser = {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    avatar: session.user.image ?? null,
    role: session.user.role ?? null,
  }

  return (
    <html lang="en" suppressHydrationWarning className={"antialiased"}>
      <body>
        <SidebarProvider>
          <TooltipProvider>
            <AppSidebar user={sidebarUser} />
            <SidebarInset>{children}</SidebarInset>
          </TooltipProvider>
        </SidebarProvider>
      </body>
    </html>
  )
}
