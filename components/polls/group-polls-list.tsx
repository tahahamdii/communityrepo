"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { PollCard } from "./poll-card"
import { CreatePollDialog } from "./create-poll-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, PlusCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GroupPollsListProps {
  groupId: string
  isMember: boolean
}

export function GroupPollsList({ groupId, isMember }: GroupPollsListProps) {
  const { token } = useAuth()
  const [polls, setPolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("active")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const fetchPolls = async (showExpired = false) => {
    try {
      setLoading(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/polls/group/${groupId}?showExpired=${showExpired}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        },
      )

      if (!res.ok) {
        if (res.status === 403) {
          setPolls([])
          return
        }
        throw new Error("Failed to fetch polls")
      }

      const data = await res.json()
      setPolls(data.polls)
      setError(null)
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching polls")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolls(activeTab === "ended")
  }, [groupId, activeTab, token])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    fetchPolls(value === "ended")
  }

  const handlePollCreated = () => {
    setCreateDialogOpen(false)
    fetchPolls(activeTab === "ended")
  }

  if (!isMember) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">Join the group to see polls</h3>
        <p className="text-muted-foreground">You need to be a member to view and participate in group polls</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="active">Active Polls</TabsTrigger>
            <TabsTrigger value="ended">Ended Polls</TabsTrigger>
          </TabsList>
        </Tabs>

        {token && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Poll
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-3/4 mb-4" />
                <div className="space-y-3">
                  {Array(3)
                    .fill(0)
                    .map((_, j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ))}
                </div>
              </div>
            ))
        ) : polls.length > 0 ? (
          polls.map((poll) => <PollCard key={poll._id} poll={poll} onVote={() => fetchPolls(activeTab === "ended")} />)
        ) : (
          <div className="col-span-full text-center py-10">
            <h3 className="text-lg font-medium">No {activeTab} polls</h3>
            <p className="text-muted-foreground">
              {activeTab === "active" ? "Be the first to create a poll for this group" : "No polls have ended yet"}
            </p>
          </div>
        )}
      </div>

      <CreatePollDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onPollCreated={handlePollCreated}
        groupId={groupId}
      />
    </div>
  )
}
