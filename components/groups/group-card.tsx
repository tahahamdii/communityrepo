"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Lock } from "lucide-react"
import Link from "next/link"

interface GroupCardProps {
  group: any
}

export function GroupCard({ group }: GroupCardProps) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)

  const handleJoinGroup = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to join groups",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${group._id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to join group")

      const data = await res.json()
      toast({
        title: "Success",
        description: data.message,
      })

      setJoined(true)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred while joining the group",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link href={`/groups/${group._id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={group.logo || "/placeholder.svg"} alt={group.name} />
              <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-lg flex items-center justify-center gap-2">
            {group.name}
            {group.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="capitalize">
              {group.category}
            </Badge>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {group.membersCount || group.members?.length || 0}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-center mb-4 line-clamp-3">{group.description}</CardDescription>
          <Button
            onClick={handleJoinGroup}
            disabled={loading || joined}
            className="w-full"
            variant={joined ? "outline" : "default"}
          >
            {loading ? "Joining..." : joined ? "Joined" : group.isPrivate ? "Request to Join" : "Join Group"}
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
