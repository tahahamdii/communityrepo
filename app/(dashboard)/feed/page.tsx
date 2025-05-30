"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { PostCard } from "@/components/posts/post-card"
import { CreatePostForm } from "@/components/posts/create-post-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FeedPage() {
  const { token } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = async (pageNum: number) => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/feed?page=${pageNum}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to fetch posts")

      const data = await res.json()

      if (pageNum === 1) {
        setPosts(data.posts)
      } else {
        setPosts((prev) => [...prev, ...data.posts])
      }

      setHasMore(data.pagination.page < data.pagination.pages)
      setError(null)
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching posts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchPosts(1)
    }
  }, [token])

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPosts(nextPage)
    }
  }

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - for larger screens */}
        <div className="hidden md:block">
          <div className="sticky top-20">
            <h3 className="text-lg font-medium mb-4">Quick Navigation</h3>
            <nav className="space-y-2">
              <a href="/feed" className="flex items-center p-2 bg-secondary rounded-md">
                <span>News Feed</span>
              </a>
              <a href="/polls" className="flex items-center p-2 hover:bg-secondary/50 rounded-md">
                <span>Live Polls</span>
              </a>
              <a href="/groups/discover" className="flex items-center p-2 hover:bg-secondary/50 rounded-md">
                <span>Discover Groups</span>
              </a>
              <a href="/rankings" className="flex items-center p-2 hover:bg-secondary/50 rounded-md">
                <span>Rankings</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Main content area */}
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-6">News Feed</h1>

          <CreatePostForm onPostCreated={() => fetchPosts(1)} />

          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 space-y-6">
            {loading && page === 1 ? (
              // Show skeletons while loading initial data
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="post-card">
                    <div className="flex items-center space-x-4 mb-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))
            ) : posts.length > 0 ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">No posts yet</h3>
                <p className="text-muted-foreground">Follow some teams or join groups to see posts in your feed</p>
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={loadMore} disabled={loading}>
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
