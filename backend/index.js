import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";
import Tweet from "./models/tweet.js"; 

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Twiller backend is running successfully");
});

const port = process.env.PORT || 5000;
const url = process.env.MONOGDB_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// ==========================================
// USER ROUTES
// ==========================================

// Register
app.post("/register", async (req, res) => {
  try {
    const existinguser = await User.findOne({ email: req.body.email });
    if (existinguser) {
      return res.status(200).json(existinguser);
    }
    const newUser = new User(req.body);
    await newUser.save();
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Logged in user
app.get("/loggedinuser", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Update Profile
app.patch("/userupdate/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const updated = await User.findOneAndUpdate(
      { email },
      { $set: req.body },
      { new: true, upsert: false }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// ==========================================
// TWEET ROUTES
// ==========================================

// POST a new tweet
app.post("/post", async (req, res) => {
  try {
    const tweet = new Tweet(req.body);
    await tweet.save();
    
    
    const populatedTweet = await Tweet.findById(tweet._id).populate("author");
    
    return res.status(201).json(populatedTweet);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// GET all tweets
app.get("/post", async (req, res) => {
  try {
    const tweets = await Tweet.find().sort({ timestamp: -1 }).populate("author");
    return res.status(200).json(tweets); // ✅ Standardized to .json()
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// LIKE / UNLIKE Tweet (Toggle functionality)
app.post("/like/:tweetid", async (req, res) => {
  try {
    const { userId } = req.body;
    const tweet = await Tweet.findById(req.params.tweetid);
    
    if (!tweet) return res.status(404).json({ error: "Tweet not found" });

    
    const userIndex = tweet.likedBy.indexOf(userId);
    if (userIndex === -1) {
      // User hasn't liked it yet -> Add Like
      tweet.likes += 1;
      tweet.likedBy.push(userId);
    } else {
      // User already liked it -> Remove Like (Unlike)
      tweet.likes -= 1;
      tweet.likedBy.splice(userIndex, 1);
    }
    
    await tweet.save();
    res.status(200).json(tweet);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// RETWEET / UN-RETWEET (Toggle functionality)
app.post("/retweet/:tweetid", async (req, res) => {
  try {
    const { userId } = req.body;
    const tweet = await Tweet.findById(req.params.tweetid);
    
    if (!tweet) return res.status(404).json({ error: "Tweet not found" });

    
    const userIndex = tweet.retweetedBy.indexOf(userId);
    if (userIndex === -1) {
      tweet.retweets += 1;
      tweet.retweetedBy.push(userId);
    } else {
      tweet.retweets -= 1;
      tweet.retweetedBy.splice(userIndex, 1);
    }
    
    await tweet.save();
    res.status(200).json(tweet);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});