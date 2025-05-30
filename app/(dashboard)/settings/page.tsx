"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Save, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const { user, token, login } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    bio: "",
    profilePicture: "",
    favoriteSports: [] as string[],
  })
  const [sportInput, setSportInput] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || "",
        profilePicture: user.profilePicture || "",
        favoriteSports: user.favoriteSports || [],
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to update profile")

      const data = await res.json()

      // Update user in auth context
      login(token, data.user)

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your profile")
    } finally {
      setLoading(false)
    }
  }

  const handleAddSport = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const sport = sportInput.trim()
      if (sport && !formData.favoriteSports.includes(sport) && formData.favoriteSports.length < 10) {
        setFormData((prev) => ({
          ...prev,
          favoriteSports: [...prev.favoriteSports, sport],
        }))
        setSportInput("")
      }
    }
  }

  const removeSport = (sportToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      favoriteSports: prev.favoriteSports.filter((sport) => sport !== sportToRemove),
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="container py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture URL</Label>
                <Input
                  id="profilePicture"
                  name="profilePicture"
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={formData.profilePicture}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sports Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Sports Preferences</CardTitle>
              <CardDescription>Add your favorite sports to personalize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sports">Favorite Sports</Label>
                <Input
                  id="sports"
                  placeholder="Add a sport (press Enter or comma to add)"
                  value={sportInput}
                  onChange={(e) => setSportInput(e.target.value)}
                  onKeyDown={handleAddSport}
                  disabled={formData.favoriteSports.length >= 10}
                />
                <p className="text-xs text-muted-foreground">
                  You can add up to 10 sports. Press Enter or comma to add each sport.
                </p>
              </div>

              {formData.favoriteSports.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.favoriteSports.map((sport) => (
                    <Badge key={sport} variant="secondary" className="flex items-center gap-1">
                      {sport}
                      <button type="button" onClick={() => removeSport(sport)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details (read-only)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={user?.username || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label>Account Level</Label>
                <div className="flex items-center space-x-2">
                  <Badge className="badge-level">{user?.level || 1}</Badge>
                  <span className="text-sm text-muted-foreground">{user?.points || 0} XP</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
