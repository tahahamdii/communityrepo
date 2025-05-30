"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PostCard } from "@/components/posts/post-card"
import { GroupCard } from "@/components/groups/group-card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Search } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SearchPage() {
  const { token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [activeTab, setActiveTab] = useState(searchParams.get("type") || "all")
  const [results, setResults] = useState<any>({
    users: [],
    groups: [],
    posts: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  
  const search = async (q: string, type: string, pageNum: number) => {
    if (!q.trim()) return
    
    try {
      setLoading(true)
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/search?query=${encodeURIComponent(q)}`
      
      if (type !== "all") {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/search/${type}?query=${encodeURIComponent(q)}&page=${pageNum}&limit=10`
      }
      
      const res = await fetch(url, {
        headers: token ? {
          Authorization: `Bearer ${token}`
        } : {}
      })
      
      if (!res.ok) throw new Error("Search failed")
      
      const data = await res.json()
      
      if (type === "all") {
        setResults(data.results)
        setHasMore(false)
      } else {
        const resultKey = type
        if (pageNum === 1) {
          setResults(prev => ({
            ...prev,
            [resultKey]: data[resultKey]
          }))
        } else {
          setResults(prev => ({
            ...prev,
            [resultKey]: [...prev[resultKey], ...data[resultKey]]
          }))
        }
        
        setHasMore(data.pagination.page < data.pagination.pages)
      }
      
      setError(null)
    } catch (err: any) {
      setError(err.message || "An error occurred while searching")
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    const q = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all"
    
    if (q) {
      setQuery(q)
      setActiveTab(type)
      search(q, type, 1)
    }
  }, [searchParams])
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    const params = new URLSearchParams()
    params.set("q", query)
    params.set("type", activeTab)
    
    router.push(`/search?${params.toString()}`)
  }
  
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (query.trim()) {
      const params = new URLSearchParams()
      params.set("q", query)
      params.set("type", value)
      
      router.push(`/search?${params.toString()}`)
    }
  }
  
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      search(query, activeTab, nextPage)
    }
  }

  return (
    <div className="container py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Search FanZone</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            placeholder="Search for users, groups, or posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {query && (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-8">
                {results.users?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Users</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.users.slice(0, 4).map((user: any) => (
                        <div key={user._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <Avatar>
                            <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.username} />
                            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.groups?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Groups</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.groups.slice(0, 3).map((group: any) => (
                        <GroupCard key={group._id} group={group} />
                      ))}
                    </div>
                  </div>
                )}

                {results.posts?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Posts</h3>
                    <div className="space-y-4">
                      {results.posts.slice(0, 3).map((post: any) => (
                        <PostCard key={post._id} post={post} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))
                ) : results.users?.length > 0 ? (
                  results.users.map((user: any) => (
                    <div key={user._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.username} />
                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.bio}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="groups">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="border rounded-lg p-6">
                      <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                      <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mx-auto" />
                    </div>
                  ))
                ) : results.groups?.length > 0 ? (
                  results.groups.map((group: any) => (
                    <GroupCard key={group._id} group={group} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No groups found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="posts">
              <div className="space-y-6">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
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
                ) : results.posts?.length > 0 ? (
                  results.posts.map((post: any) => (
                    <PostCard key={post._id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No posts found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {hasMore && activeTab !== "all" && (
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={loadMore} disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
