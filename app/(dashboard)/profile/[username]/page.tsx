"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PostCard } from "@/components/posts/post-card"
import { AlertCircle, Calendar, Users, Trophy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDistanceToNow } from "date-fns"

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user: currentUser, token } = useAuth()
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [postsLoading, setPostsLoading] = useState(false)

  useEffect(() => {
    if (params.username) {
      fetchUserProfile()
      fetchUserPosts()
    }
  }, [params.username])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.username}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      })

      if (!res.ok) throw new Error("Failed to fetch user profile")

      const data = await res.json()
      setUser(data.user)
      setError(null)
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching the profile")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.username}/activity`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      })

      if (!res.ok) throw new Error("Failed to fetch user posts")

      const data = await res.json()
      setPosts(data.posts)
    } catch (err: any) {
      console.error(err)
    } finally {
      setPostsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="flex items-center space-x-6 mb-8">
              <div className="h-24 w-24 bg-muted rounded-full"></div>
              <div className="space-y-3">
                <div className="h-8 bg-muted rounded-md w-48"></div>
                <div className="h-4 bg-muted rounded-md w-32"></div>
                <div className="h-4 bg-muted rounded-md w-64"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg"></div>
                ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user) return null

  const isOwnProfile = currentUser?.username === user.username

  return (
    <div className="container py-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
          <Avatar className="h-24 w-24 border">
            <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.username} />
            <AvatarFallback className="text-2xl">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">{user.username}</h1>
                <div className="flex items-center space-x-4 text-muted-foreground mt-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1" />
                    Level {user.level}
                  </div>
                </div>
              </div>

              {isOwnProfile && <Button variant="outline">Edit Profile</Button>}
            </div>

            {user.bio && <p className="text-muted-foreground mb-4">{user.bio}</p>}

            {/* Favorite Sports */}
            {user.favoriteSports && user.favoriteSports.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {user.favoriteSports.map((sport: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {sport}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.points}</div>
              <p className="text-xs text-muted-foreground">XP earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.level}</div>
              <p className="text-xs text-muted-foreground">Current level</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Favorite Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.favoriteTeams?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Teams followed</p>
            </CardContent>
          </Card>
        </div>

        {/* Favorite Teams */}
        {user.favoriteTeams && user.favoriteTeams.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Favorite Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.favoriteTeams.map((team: any) => (
                  <div key={team._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={team.logo || "/placeholder.svg"} alt={team.name} />
                      <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{team.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {postsLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="border rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))
            ) : posts.length > 0 ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No posts yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't created any posts yet" : `${user.username} hasn't posted anything yet`}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">Activity Timeline</h3>
              <p className="text-muted-foreground">Coming soon - view detailed activity history</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
