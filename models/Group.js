import mongoose from "mongoose"

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: ["club", "sport", "league", "other"],
    },
    logo: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    rules: [
      {
        title: String,
        description: String,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
)

// Create text index for search functionality
groupSchema.index({ name: "text", description: "text", tags: "text" })

const Group = mongoose.model("Group", groupSchema)

export default Group
