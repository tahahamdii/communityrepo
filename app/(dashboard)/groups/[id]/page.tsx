"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { PostCard } from "@/components/posts/post-card"
import { CreatePostForm } from "@/components/posts/create-post-form"
import { GroupPollsList } from "@/components/polls/group-polls-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MembersDialog } from "@/components/groups/members-dialog"
import { AlertCircle, Info, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function GroupPage({ params }: { params: { id: string } }) {
  const { token, user } = useAuth()
  const { toast } = useToast()
  const [group, setGroup] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [postsPage, setPostsPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const [membersDialogOpen, setMembersDialogOpen] = useState(false)

  const fetchGroup = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${params.id}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      })

      if (!res.ok) {
        if (res.status === 403) {
          const data = await res.json()
          // Handle private group that user is not a member of
          setGroup({
            _id: params.id,
            name: data.name,
            description: data.description,
            category: data.category,
            logo: data.logo,
            isPrivate: data.isPrivate,
            membersCount: data.membersCount,
          })
          setIsMember(false)
          return
        }
        throw new Error("Failed to fetch group")
      }

      const data = await res.json()
      setGroup(data.group)

      // Check if user is a member
      if (user && data.group.members) {
        setIsMember(data.group.members.includes(user.id))
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching group")
    } finally {
      setLoading(false)
    }
  }

  const fetchGroupPosts = async (pageNum: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/group/${params.id}?page=${pageNum}&limit=10`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        },
      )

      if (!res.ok) {
        if (res.status !== 403) {
          // Don't throw error for private groups
          throw new Error("Failed to fetch group posts")
        }
        return
      }

      const data = await res.json()

      if (pageNum === 1) {
        setPosts(data.posts)
      } else {
        setPosts((prev) => [...prev, ...data.posts])
      }

      setHasMorePosts(data.pagination.page < data.pagination.pages)
    } catch (err: any) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchGroup()
      fetchGroupPosts(1)
    }
  }, [params.id, token, user])

  const loadMorePosts = () => {
    if (!loading && hasMorePosts) {
      const nextPage = postsPage + 1
      setPostsPage(nextPage)
      fetchGroupPosts(nextPage)
    }
  }

  const handleJoinGroup = async () => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to join this group",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${params.id}/join`, {
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

      setIsMember(true)
      fetchGroup() // Refresh group data
      fetchGroupPosts(1) // Refresh posts
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred while joining the group",
        variant: "destructive",
      })
    }
  }

  const handleLeaveGroup = async () => {
    if (!token) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${params.id}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to leave group")

      const data = await res.json()
      toast({
        title: "Success",
        description: data.message,
      })

      setIsMember(false)
      fetchGroup() // Refresh group data
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred while leaving the group",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-6"></div>
          <div className="h-8 bg-muted rounded-md w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded-md mb-2 w-2/3"></div>
          <div className="h-4 bg-muted rounded-md mb-6 w-1/2"></div>
          <div className="h-10 bg-muted rounded-md w-32 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
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

  if (!group) return null

  return (
    <div className="container py-6">
      {/* Group header */}
      <div className="rounded-lg overflow-hidden mb-6">
        {group.coverImage ? (
          <div className="h-32 md:h-48 bg-cover bg-center" style={{ backgroundImage: `url(${group.coverImage})` }} />
        ) : (
          <div className="h-32 md:h-48 bg-gradient-to-r from-team-primary to-team-secondary" />
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={group.logo || "/placeholder.svg"} alt={group.name} />
            <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="capitalize">{group.category}</span>
              <span>•</span>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {group.membersCount} member{group.membersCount !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {group.isPrivate && !isMember ? (
          <Button onClick={handleJoinGroup} className="w-full md:w-auto">
            Request to Join
          </Button>
        ) : isMember ? (
          <Button variant="outline" onClick={handleLeaveGroup} className="w-full md:w-auto">
            Leave Group
          </Button>
        ) : (
          <Button onClick={handleJoinGroup} className="w-full md:w-auto">
            Join Group
          </Button>
        )}
      </div>

      {group.isPrivate && !isMember ? (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>This is a private group. Join to see posts and discussions.</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="discussion" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
            <TabsTrigger value="polls">Polls</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="discussion" className="space-y-6">
            {isMember && <CreatePostForm groupId={params.id} onPostCreated={() => fetchGroupPosts(1)} />}

            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}

                {hasMorePosts && (
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={loadMorePosts}>
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No posts yet</h3>
                <p className="text-muted-foreground">Be the first to start a discussion in this group</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="polls">
            <GroupPollsList groupId={params.id} isMember={isMember} />
          </TabsContent>

          <TabsContent value="about">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">About this group</h3>
                <p className="whitespace-pre-line">{group.description}</p>
              </div>

              {group.rules && group.rules.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Group Rules</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {group.rules.map((rule: any, index: number) => (
                      <li key={index}>
                        <span className="font-medium">{rule.title}:</span> {rule.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <Button variant="outline" onClick={() => setMembersDialogOpen(true)}>
                  <Users className="mr-2 h-4 w-4" />
                  View Members
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {group && <MembersDialog groupId={params.id} open={membersDialogOpen} onOpenChange={setMembersDialogOpen} />}
    </div>
  )
}
