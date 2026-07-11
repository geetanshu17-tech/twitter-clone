import mongoose from "mongoose";

const TweetSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, default: "" }, 
  likes: { type: Number, default: 0 },
  retweets: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  retweetedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  image: { type: String, default: null },
  
  audio: {
    url: { type: String, default: null },
    duration: { type: Number, default: null },
    size: { type: Number, default: null }
  },

  timestamp: { type: Date, default: Date.now }, 
});

TweetSchema.pre("validate", function () {
  const hasContent = this.content && this.content.trim().length > 0;
  const hasImage = this.image && this.image.trim().length > 0;
  const hasAudio = this.audio && this.audio.url && this.audio.url.trim().length > 0;

  if (!hasContent && !hasImage && !hasAudio) {
    throw new Error("Tweet validation failed: A post must contain text, an image, or audio.");
  }
});

export default mongoose.model("Tweet", TweetSchema);