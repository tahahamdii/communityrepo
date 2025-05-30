"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Menu, Search, Home, Users, BarChart3, Trophy, User, Settings, LogOut } from "lucide-react"

export function MobileNav() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
      setOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    setOpen(false)
  }

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-8 w-8 bg-gradient-to-r from-team-primary to-team-secondary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">FZ</span>
              </div>
              <span className="text-xl font-bold">FanZone</span>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search FanZone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              <Link
                href="/feed"
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary transition-colors"
                onClick={() => setOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Feed</span>
              </Link>
              <Link
                href="/groups/discover"
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary transition-colors"
                onClick={() => setOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>Groups</span>
              </Link>
              <Link
                href="/polls"
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary transition-colors"
                onClick={() => setOpen(false)}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Polls</span>
              </Link>
              <Link
                href="/rankings"
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary transition-colors"
                onClick={() => setOpen(false)}
              >
                <Trophy className="h-5 w-5" />
                <span>Rankings</span>
              </Link>
            </nav>

            {/* User Section */}
            <div className="border-t pt-4 space-y-2">
              <Link
                href={`/profile/${user?.username}`}
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary transition-colors"
                onClick={() => setOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary transition-colors"
                onClick={() => setOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary transition-colors w-full text-left text-red-600"
              >
                <LogOut className="h-5 w-5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
