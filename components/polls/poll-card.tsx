"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface PollCardProps {
  poll: any
  onVote?: () => void
}

export function PollCard({ poll, onVote }: PollCardProps) {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const isExpired = new Date(poll.expiresAt) < new Date()
  const totalVotes = poll.totalVotes || 0

  // Check if user has voted
  const userVote = poll.options?.findIndex((option: any) => option.votes?.includes(user?.id))
  const hasVoted = userVote !== -1

  const handleVote = async (optionIndex: number) => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote",
        variant: "destructive",
      })
      return
    }

    if (isExpired) {
      toast({
        title: "Poll expired",
        description: "This poll is no longer accepting votes",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/polls/${poll._id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ optionIndex }),
      })

      if (!res.ok) throw new Error("Failed to vote")

      const data = await res.json()
      toast({
        title: "Success",
        description: "Your vote has been recorded",
      })

      if (onVote) onVote()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred while voting",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getOptionPercentage = (option: any) => {
    if (totalVotes === 0) return 0
    return Math.round(((option.votes?.length || 0) / totalVotes) * 100)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={poll.creator?.profilePicture || "/placeholder.svg"} alt={poll.creator?.username} />
              <AvatarFallback>{poll.creator?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/profile/${poll.creator?.username}`} className="text-sm font-medium hover:underline">
                {poll.creator?.username}
              </Link>
              {poll.group && (
                <div className="text-xs text-muted-foreground">
                  in{" "}
                  <Link href={`/groups/${poll.group._id}`} className="text-team-primary hover:underline">
                    {poll.group.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isExpired ? <Badge variant="secondary">Ended</Badge> : <Badge variant="default">Live</Badge>}
          </div>
        </div>
        <CardTitle className="text-lg">{poll.question}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Poll options */}
        <div className="space-y-3">
          {poll.options?.map((option: any, index: number) => {
            const percentage = getOptionPercentage(option)
            const isUserChoice = userVote === index
            const votesCount = option.votes?.length || 0

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center">
                    {option.text}
                    {isUserChoice && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
                  </span>
                  <span className="text-sm text-muted-foreground">{percentage}%</span>
                </div>

                {hasVoted || isExpired ? (
                  <div className="poll-option-bar">
                    <div className="poll-option-fill" style={{ width: `${percentage}%` }} />
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                      <span className="text-sm font-medium text-foreground">{option.text}</span>
                      <span className="text-sm text-muted-foreground">{votesCount}</span>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleVote(index)}
                    disabled={loading}
                  >
                    {option.text}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Poll stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {isExpired
                ? `Ended ${formatDistanceToNow(new Date(poll.expiresAt), { addSuffix: true })}`
                : `Ends ${formatDistanceToNow(new Date(poll.expiresAt), { addSuffix: true })}`}
            </div>
          </div>
        </div>

        {/* Poll tags */}
        {poll.tags && poll.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {poll.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
