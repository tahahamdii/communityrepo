import mongoose from "mongoose"

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    images: [
      {
        type: String,
      },
    ],
    links: [
      {
        url: String,
        title: String,
        description: String,
        image: String,
      },
    ],
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    reactions: {
      likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      shares: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
      },
    ],
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

// Create text index for search functionality
postSchema.index({ content: "text", tags: "text" })

const Post = mongoose.model("Post", postSchema)

export default Post
