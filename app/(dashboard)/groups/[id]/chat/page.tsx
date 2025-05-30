"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { GroupChat } from "@/components/chat/group-chat"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function GroupChatPage({ params }: { params: { id: string } }) {
  const { token } = useAuth()
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id && token) {
      fetchGroup()
    }
  }, [params.id, token])

  const fetchGroup = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to fetch group")

      const data = await res.json()
      setGroup(data.group)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-48 mb-6"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Group not found</h1>
          <Link href="/groups/discover">
            <Button>Discover Groups</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Link href={`/groups/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Group
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{group.name} Chat</h1>
        </div>

        <GroupChat groupId={params.id} groupName={group.name} />
      </div>
    </div>
  )
}
