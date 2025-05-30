"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ImageIcon, X } from "lucide-react"

interface CreatePostFormProps {
  groupId?: string
  onPostCreated?: () => void
}

export function CreatePostForm({ groupId, onPostCreated }: CreatePostFormProps) {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !content.trim()) return

    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          groupId: groupId || null,
          tags,
        }),
      })

      if (!res.ok) throw new Error("Failed to create post")

      const data = await res.json()
      toast({
        title: "Success",
        description: "Post created successfully",
      })

      // Reset form
      setContent("")
      setTags([])
      setTagInput("")

      if (onPostCreated) onPostCreated()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred while creating the post",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag])
        setTagInput("")
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  if (!user) return null

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-3">
            <Avatar>
              <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.username} />
              <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder={groupId ? "Share something with the group..." : "What's on your mind?"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0"
                maxLength={5000}
              />
            </div>
          </div>

          {/* Tags input */}
          <div className="space-y-2">
            <Input
              placeholder="Add tags (press Enter or comma to add)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              disabled={tags.length >= 5}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Button type="button" variant="ghost" size="sm" disabled>
                <ImageIcon className="h-4 w-4 mr-2" />
                Photo
              </Button>
              <span className="text-xs text-muted-foreground">{content.length}/5000</span>
            </div>
            <Button type="submit" disabled={!content.trim() || loading}>
              {loading ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
