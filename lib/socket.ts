"use client"

import { io, type Socket } from "socket.io-client"

class SocketManager {
  private socket: Socket | null = null
  private token: string | null = null

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket
    }

    this.token = token
    this.socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    })

    this.socket.on("connect", () => {
      console.log("Connected to server")
    })

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    this.socket.on("error", (error) => {
      console.error("Socket error:", error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket() {
    return this.socket
  }

  joinGroup(groupId: string) {
    if (this.socket) {
      this.socket.emit("join-group", groupId)
    }
  }

  leaveGroup(groupId: string) {
    if (this.socket) {
      this.socket.emit("leave-group", groupId)
    }
  }

  sendMessage(groupId: string, content: string, event?: string) {
    if (this.socket) {
      this.socket.emit("send-message", {
        groupId,
        content,
        event,
      })
    }
  }

  onMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on("new-message", callback)
    }
  }

  onRecentMessages(callback: (messages: any[]) => void) {
    if (this.socket) {
      this.socket.on("recent-messages", callback)
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on("user-typing", callback)
    }
  }

  sendTyping(groupId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit("typing", { groupId, isTyping })
    }
  }
}

export const socketManager = new SocketManager()
