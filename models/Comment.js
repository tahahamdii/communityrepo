import mongoose from "mongoose"

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    reactions: {
      likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
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

const Comment = mongoose.model("Comment", commentSchema)

export default Comment
