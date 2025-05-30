"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { GroupCard } from "@/components/groups/group-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DiscoverGroupsPage() {
  const { token } = useAuth()
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [category, setCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchGroups = async (pageNum: number, cat: string = category, query: string = searchQuery) => {
    try {
      setLoading(true)
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/groups?page=${pageNum}&limit=12`

      if (cat && cat !== "all") {
        url += `&category=${cat}`
      }

      if (query) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/search/groups?query=${query}&page=${pageNum}&limit=12`
      }

      const res = await fetch(url, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      })

      if (!res.ok) throw new Error("Failed to fetch groups")

      const data = await res.json()
      const groupsData = query ? data.groups : data.groups

      if (pageNum === 1) {
        setGroups(groupsData)
      } else {
        setGroups((prev) => [...prev, ...groupsData])
      }

      const pagination = query ? data.pagination : data.pagination
      setHasMore(pagination.page < pagination.pages)
      setError(null)
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching groups")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups(1)
  }, [token])

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchGroups(nextPage)
    }
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setPage(1)
    fetchGroups(1, value, searchQuery)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchGroups(1, category, searchQuery)
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-bold mb-2">Discover Groups</h1>
        <p className="text-muted-foreground">Find and join fan groups for your favorite teams and sports</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>

        <div className="w-full md:w-64">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="club">Clubs</SelectItem>
                <SelectItem value="sport">Sports</SelectItem>
                <SelectItem value="league">Leagues</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && page === 1 ? (
          // Show skeletons while loading initial data
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mx-auto mb-4" />
                <div className="flex justify-center">
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))
        ) : groups.length > 0 ? (
          groups.map((group) => <GroupCard key={group._id} group={group} />)
        ) : (
          <div className="col-span-full text-center py-10">
            <h3 className="text-lg font-medium">No groups found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
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
    </div>
  )
}
