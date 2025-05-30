"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Medal, Trophy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RankingsPage() {
  const { token, user } = useAuth()
  const [rankings, setRankings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [userLevel, setUserLevel] = useState<any>(null)
  const [userRank, setUserRank] = useState<number | null>(null)

  const fetchRankings = async (pageNum: number) => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rankings/global?page=${pageNum}&limit=20`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      })

      if (!res.ok) throw new Error("Failed to fetch rankings")

      const data = await res.json()

      if (pageNum === 1) {
        setRankings(data.rankings)
      } else {
        setRankings((prev) => [...prev, ...data.rankings])
      }

      if (data.userRank !== undefined) {
        setUserRank(data.userRank)
      }

      setHasMore(data.pagination.page < data.pagination.pages)
      setError(null)
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching rankings")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserLevel = async () => {
    if (!token) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rankings/level`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to fetch user level")

      const data = await res.json()
      setUserLevel(data)
    } catch (err: any) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchRankings(1)
    if (token) {
      fetchUserLevel()
    }
  }, [token])

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchRankings(nextPage)
    }
  }

  // Get medal for top 3 ranks
  const getMedal = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />
    return <span className="font-semibold">{rank}</span>
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-2">Fan Rankings</h1>
      <p className="text-muted-foreground mb-6">See who's leading the FanZone community</p>

      {token && userLevel && (
        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Your Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Level</p>
              <div className="flex items-center">
                <span className="badge-level mr-2">{userLevel.level}</span>
                <span className="text-lg font-medium">Fan</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Points</p>
              <p className="text-lg font-medium">{userLevel.points} XP</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Rank</p>
              <p className="text-lg font-medium">{userRank !== null ? `#${userRank}` : "Unranked"}</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {userLevel.level + 1}</span>
              <span>{userLevel.progressPercentage}%</span>
            </div>
            <Progress value={userLevel.progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">{userLevel.pointsToNextLevel} XP needed for next level</p>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="leaderboard">
        <TabsList className="mb-6">
          <TabsTrigger value="leaderboard">Global Leaderboard</TabsTrigger>
          <TabsTrigger value="how-to">How to Rank Up</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4 border-b">
              <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-7">User</div>
                <div className="col-span-2 text-right">Level</div>
                <div className="col-span-2 text-right">Points</div>
              </div>
            </div>

            <div className="divide-y">
              {loading && rankings.length === 0 ? (
                // Show skeletons while loading
                Array(10)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="p-4">
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-1 text-center">
                          <Skeleton className="h-6 w-6 rounded-full mx-auto" />
                        </div>
                        <div className="col-span-7">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                        <div className="col-span-2 text-right">
                          <Skeleton className="h-4 w-8 ml-auto" />
                        </div>
                        <div className="col-span-2 text-right">
                          <Skeleton className="h-4 w-12 ml-auto" />
                        </div>
                      </div>
                    </div>
                  ))
              ) : rankings.length > 0 ? (
                rankings.map((rank, index) => (
                  <div key={rank._id} className={`p-4 ${user && rank._id === user.id ? "bg-muted/50" : ""}`}>
                    <div className="grid grid-cols-12 items-center">
                      <div className="col-span-1 text-center">{getMedal(index + 1)}</div>
                      <div className="col-span-7">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={rank.profilePicture || "/placeholder.svg"} alt={rank.username} />
                            <AvatarFallback>{rank.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{rank.username}</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="badge-level">{rank.level}</span>
                      </div>
                      <div className="col-span-2 text-right font-medium">{rank.points} XP</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No ranking data available</p>
                </div>
              )}
            </div>

            {hasMore && (
              <div className="p-4 border-t text-center">
                <Button variant="outline" onClick={loadMore} disabled={loading}>
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="how-to">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">How to Earn Points</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Creating Content</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Creating a new post</span>
                      <span className="font-medium">+5 XP</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Commenting on posts</span>
                      <span className="font-medium">+2 XP</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Creating a new poll</span>
                      <span className="font-medium">+10 XP</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Creating a new group</span>
                      <span className="font-medium">+20 XP</span>
                    </li>
                  </ul>
                </div>

                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Engagement</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Getting likes/shares on posts</span>
                      <span className="font-medium">+1 XP each</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Voting in polls</span>
                      <span className="font-medium">+1 XP</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Joining a group</span>
                      <span className="font-medium">+2 XP</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Sending chat messages</span>
                      <span className="font-medium">+1 XP</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-muted rounded-md p-4">
                <h4 className="font-medium mb-2">Leveling Up</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Every 100 XP you earn will increase your level by 1. Higher levels unlock special badges and features.
                </p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Level 1 to 2</span>
                      <span>100 XP</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Level 2 to 3</span>
                      <span>100 XP</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
