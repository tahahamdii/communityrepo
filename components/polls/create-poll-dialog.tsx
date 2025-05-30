"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface CreatePollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPollCreated?: () => void
  groupId?: string
}

export function CreatePollDialog({ open, onOpenChange, onPollCreated, groupId }: CreatePollDialogProps) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<any[]>([])
  const [formData, setFormData] = useState({
    question: "",
    options: ["", ""],
    selectedGroupId: groupId || "general", // Updated default value
    expiresIn: "24", // hours
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (open && !groupId) {
      fetchUserGroups()
    }
  }, [open, groupId])

  const fetchUserGroups = async () => {
    try {
      // This would need to be implemented in the backend
      // For now, we'll skip this functionality
    } catch (err) {
      console.error("Failed to fetch user groups")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    // Validate form
    if (!formData.question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      })
      return
    }

    const validOptions = formData.options.filter((option) => option.trim())
    if (validOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please provide at least 2 options",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + Number.parseInt(formData.expiresIn))

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/polls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: formData.question.trim(),
          options: validOptions,
          groupId: formData.selectedGroupId || null,
          expiresAt: expiresAt.toISOString(),
          tags: formData.tags,
        }),
      })

      if (!res.ok) throw new Error("Failed to create poll")

      const data = await res.json()
      toast({
        title: "Success",
        description: "Poll created successfully",
      })

      // Reset form
      setFormData({
        question: "",
        options: ["", ""],
        selectedGroupId: groupId || "general", // Updated default value
        expiresIn: "24",
        tags: [],
      })
      setTagInput("")
      if (onPollCreated) onPollCreated()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred while creating the poll",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }))
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }))
    }
  }

  const updateOption = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }))
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tag],
        }))
        setTagInput("")
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Poll</DialogTitle>
          <DialogDescription>Ask a question and let the community vote on the options.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              placeholder="What would you like to ask?"
              value={formData.question}
              onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
              maxLength={500}
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Options</Label>
            {formData.options.map((option, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  maxLength={100}
                />
                {formData.options.length > 2 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {formData.options.length < 6 && (
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          {/* Group Selection */}
          {!groupId && (
            <div className="space-y-2">
              <Label htmlFor="group">Group (Optional)</Label>
              <Select
                value={formData.selectedGroupId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, selectedGroupId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group or leave blank for general poll" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Poll</SelectItem> {/* Updated value prop */}
                  {groups.map((group) => (
                    <SelectItem key={group._id} value={group._id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select
              value={formData.expiresIn}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, expiresIn: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">1 day</SelectItem>
                <SelectItem value="72">3 days</SelectItem>
                <SelectItem value="168">1 week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              placeholder="Add tags (press Enter or comma to add)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              disabled={formData.tags.length >= 5}
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Poll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
