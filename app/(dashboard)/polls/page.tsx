"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { PollCard } from "@/components/polls/poll-card"
import { CreatePollDialog } from "@/components/polls/create-poll-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, PlusCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PollsPage() {
  const { token } = useAuth()
  const [polls, setPolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const fetchPolls = async (pageNum: number) => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/polls?page=${pageNum}&limit=10`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      })

      if (!res.ok) throw new Error("Failed to fetch polls")

      const data = await res.json()

      if (pageNum === 1) {
        setPolls(data.polls)
      } else {
        setPolls((prev) => [...prev, ...data.polls])
      }

      setHasMore(data.pagination.page < data.pagination.pages)
      setError(null)
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching polls")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolls(1)
  }, [token])

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPolls(nextPage)
    }
  }

  const handlePollCreated = () => {
    setCreateDialogOpen(false)
    setPage(1)
    fetchPolls(1)
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Live Polls</h1>
          <p className="text-muted-foreground">Vote on polls and see real-time results</p>
        </div>

        {token && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Poll
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && page === 1 ? (
          // Show skeletons while loading initial data
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
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
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))
        ) : polls.length > 0 ? (
          polls.map((poll) => <PollCard key={poll._id} poll={poll} onVote={() => fetchPolls(1)} />)
        ) : (
          <div className="col-span-full text-center py-10">
            <h3 className="text-lg font-medium">No active polls</h3>
            <p className="text-muted-foreground">Check back later or create your own poll</p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      <CreatePollDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onPollCreated={handlePollCreated} />
    </div>
  )
}
