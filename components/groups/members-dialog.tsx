"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Crown, Shield } from "lucide-react"

interface MembersDialogProps {
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MembersDialog({ groupId, open, onOpenChange }: MembersDialogProps) {
  const { token } = useAuth()
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && groupId) {
      fetchGroupMembers()
    }
  }, [open, groupId])

  const fetchGroupMembers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      })

      if (!res.ok) throw new Error("Failed to fetch group members")

      const data = await res.json()
      setGroup(data.group)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getMemberRole = (memberId: string) => {
    if (group?.admins?.some((admin: any) => admin._id === memberId)) {
      return "admin"
    }
    if (group?.moderators?.some((mod: any) => mod._id === memberId)) {
      return "moderator"
    }
    return "member"
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">Admin</Badge>
      case "moderator":
        return <Badge variant="secondary">Moderator</Badge>
      default:
        return null
    }
  }

  // Combine all members with their roles
  const allMembers = group
    ? [
        ...(group.admins || []).map((admin: any) => ({ ...admin, role: "admin" })),
        ...(group.moderators || [])
          .filter((mod: any) => !group.admins?.some((admin: any) => admin._id === mod._id))
          .map((mod: any) => ({ ...mod, role: "moderator" })),
        ...(group.members || [])
          .filter(
            (memberId: string) =>
              !group.admins?.some((admin: any) => admin._id === memberId) &&
              !group.moderators?.some((mod: any) => mod._id === memberId),
          )
          .map((memberId: string) => ({ _id: memberId, role: "member" })),
      ]
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Group Members</DialogTitle>
          <DialogDescription>
            {group ? `${group.membersCount || 0} members in ${group.name}` : "Loading..."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto space-y-3">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
          ) : group?.admins && group?.moderators ? (
            <>
              {/* Admins */}
              {group.admins.map((admin: any) => (
                <div key={admin._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={admin.profilePicture || "/placeholder.svg"} alt={admin.username} />
                      <AvatarFallback>{admin.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{admin.username}</span>
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">Admin</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Moderators */}
              {group.moderators
                .filter((mod: any) => !group.admins.some((admin: any) => admin._id === mod._id))
                .map((moderator: any) => (
                  <div key={moderator._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={moderator.profilePicture || "/placeholder.svg"} alt={moderator.username} />
                        <AvatarFallback>{moderator.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{moderator.username}</span>
                          <Shield className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">Moderator</p>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Regular members count */}
              <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                {group.membersCount - group.admins.length - group.moderators.length} other members
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-4">No member information available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
