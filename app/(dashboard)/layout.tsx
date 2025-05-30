import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get("token")

  // If user is not logged in, redirect to login
  if (!token) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          <MobileNav />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
