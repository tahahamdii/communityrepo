import mongoose from "mongoose"

const pollSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: true,
      maxlength: 500,
    },
    options: [
      {
        text: {
          type: String,
          required: true,
        },
        votes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isLive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    totalVotes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

const Poll = mongoose.model("Poll", pollSchema)

export default Poll
