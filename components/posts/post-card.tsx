"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface PostCardProps {
  post: any
  onUpdate?: () => void
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")

  const isLiked = post.reactions?.likes?.includes(user?.id)
  const likesCount = post.reactions?.likes?.length || 0
  const sharesCount = post.reactions?.shares?.length || 0

  const handleReaction = async (reaction: "like" | "share") => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to react to posts",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reaction }),
      })

      if (!res.ok) throw new Error("Failed to react to post")

      const data = await res.json()
      toast({
        title: "Success",
        description: data.message,
      })

      if (onUpdate) onUpdate()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newComment.trim()) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (!res.ok) throw new Error("Failed to add comment")

      const data = await res.json()
      setComments((prev) => [data.comment, ...prev])
      setNewComment("")

      toast({
        title: "Success",
        description: "Comment added successfully",
      })

      if (onUpdate) onUpdate()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleReport = async () => {
    if (!token) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/moderation/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentId: post._id,
          type: "post",
          reason: "Inappropriate content",
        }),
      })

      if (!res.ok) throw new Error("Failed to report post")

      toast({
        title: "Success",
        description: "Post reported successfully",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="post-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.author?.profilePicture || "/placeholder.svg"} alt={post.author?.username} />
              <AvatarFallback>{post.author?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <Link href={`/profile/${post.author?.username}`} className="font-medium hover:underline">
                  {post.author?.username}
                </Link>
                {post.group && (
                  <>
                    <span className="text-muted-foreground">in</span>
                    <Link href={`/groups/${post.group._id}`} className="text-team-primary hover:underline">
                      {post.group.name}
                    </Link>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Post content */}
          <p className="whitespace-pre-line">{post.content}</p>

          {/* Post images */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {post.images.map((image: string, index: number) => (
                <img
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`Post image ${index + 1}`}
                  className="rounded-md object-cover w-full h-48"
                />
              ))}
            </div>
          )}

          {/* Post tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Reaction buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction("like")}
                disabled={loading}
                className={isLiked ? "text-red-500" : ""}
              >
                <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                {likesCount}
              </Button>

              <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                {post.commentsCount || 0}
              </Button>

              <Button variant="ghost" size="sm" onClick={() => handleReaction("share")} disabled={loading}>
                <Share2 className="mr-2 h-4 w-4" />
                {sharesCount}
              </Button>
            </div>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              {/* Add comment form */}
              {token && (
                <form onSubmit={handleAddComment} className="flex space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={user?.username} />
                    <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                    <Button type="submit" size="sm" disabled={!newComment.trim()}>
                      Post
                    </Button>
                  </div>
                </form>
              )}

              {/* Comments list */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={comment.author?.profilePicture || "/placeholder.svg"}
                        alt={comment.author?.username}
                      />
                      <AvatarFallback>{comment.author?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{comment.author?.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
