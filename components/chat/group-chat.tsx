"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-provider"
import { socketManager } from "@/lib/socket"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface GroupChatProps {
  groupId: string
  groupName: string
}

export function GroupChat({ groupId, groupName }: GroupChatProps) {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [connected, setConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (token && groupId) {
      const socket = socketManager.connect(token)

      socket.on("connect", () => {
        setConnected(true)
        socketManager.joinGroup(groupId)
      })

      socket.on("disconnect", () => {
        setConnected(false)
      })

      socketManager.onRecentMessages((recentMessages) => {
        setMessages(recentMessages)
      })

      socketManager.onMessage((message) => {
        setMessages((prev) => [...prev, message])
      })

      socketManager.onUserTyping((data) => {
        if (data.userId !== user?.id) {
          setTypingUsers((prev) => {
            if (data.isTyping) {
              return prev.includes(data.username) ? prev : [...prev, data.username]
            } else {
              return prev.filter((username) => username !== data.username)
            }
          })

          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((username) => username !== data.username))
          }, 3000)
        }
      })

      return () => {
        socketManager.leaveGroup(groupId)
        socketManager.disconnect()
      }
    }
  }, [token, groupId, user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !connected) return

    socketManager.sendMessage(groupId, newMessage.trim())
    setNewMessage("")

    // Stop typing indicator
    socketManager.sendTyping(groupId, false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    // Send typing indicator
    socketManager.sendTyping(groupId, true)

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketManager.sendTyping(groupId, false)
    }, 2000)
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{groupName} Chat</span>
          </div>
          <Badge variant={connected ? "default" : "secondary"}>{connected ? "Connected" : "Disconnected"}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="chat-messages-container">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message._id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={message.sender?.profilePicture || "/placeholder.svg"}
                    alt={message.sender?.username}
                  />
                  <AvatarFallback>{message.sender?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{message.sender?.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm break-words">{message.content}</p>
                </div>
              </div>
            ))
          )}

          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span>
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.slice(0, -1).join(", ")} and ${typingUsers[typingUsers.length - 1]} are typing...`}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              placeholder={connected ? "Type a message..." : "Connecting..."}
              value={newMessage}
              onChange={handleTyping}
              disabled={!connected}
              className="flex-1"
              maxLength={1000}
            />
            <Button type="submit" disabled={!newMessage.trim() || !connected}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
