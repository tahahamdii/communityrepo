import mongoose from "mongoose"

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    event: {
      type: String,
      default: null,
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    moderationScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema)

export default ChatMessage
