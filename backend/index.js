import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import User from "./models/user.js";
import Tweet from "./models/tweet.js"; 
import Notification from "./models/notification.js";
import LoginHistory from "./models/loginHistory.js";
import {UAParser} from "ua-parser-js";

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

// Read the JSON file safely
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./firebaseServiceAccount.json", import.meta.url))
);

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static("public")); // Serve static files from the "public" directory

app.get("/", (req, res) => {
  res.send("Twitter backend is running successfully");
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
    const { email, skipOtp } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //mobile time restriction (10am to 1pm ist)
    
    const userAgentString = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgentString);
    const deviceType = parser.getDevice().type || "desktop"; 
    const browserName = parser.getBrowser().name || "unknown";

    if (deviceType.toLowerCase() === "mobile") {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        hour12: false 
      });
      const currentHourIST = parseInt(formatter.format(new Date()));
      
      if (currentHourIST < 10 || currentHourIST >= 13) {
        return res.status(403).json({ 
          error: "Mobile access restricted. Please log in between 10:00 AM and 1:00 PM IST." 
        });
      }
    }
    if (browserName.includes("Edge")) {
      return res.status(200).json(user);
    }

    // CHROME: Require OTP
    if (browserName === "Chrome" && skipOtp !== 'true') {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = generatedOtp;
      user.otpExpires = new Date(Date.now() + 5 * 60000); 
      await user.save();

      // IMPORTANT FOR DEV: Printing to terminal so you can test instantly without setting up email servers yet
      console.log(`\n🚨 [OTP GENERATED FOR CHROME] Email: ${user.email} | OTP: ${generatedOtp}\n`);

      // 206 Partial Content tells the frontend to show the OTP screen
      return res.status(206).json({ 
        requiresOtp: true, 
        email: user.email,
        message: "OTP required for Chrome" 
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if OTP matches and is not expired
    if (user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(401).json({ error: "Invalid or expired OTP." });
    }

    // Success! Clear the OTP from the database
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// GENERATE OTP FOR AUDIO UPLOAD
// ==========================================
app.post("/generate-audio-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate a 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = generatedOtp;
    user.otpExpires = new Date(Date.now() + 5 * 60000); // Expires in 5 minutes
    await user.save();

    // Log to terminal for easy testing
    console.log(`\n🚨 [AUDIO OTP GENERATED] Email: ${user.email} | OTP: \n ${generatedOtp}\n`);

    return res.status(200).json({ message: "OTP generated successfully." });
  } catch (error) {
    console.error("OTP Generation Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Update Profile
app.patch("/userupdate/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const updated = await User.findOneAndUpdate(
      { email },
      { $set: req.body },
      { returnDocument: 'after', upsert: false } // <--- Fixed
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
    const formattedData = {
      author: req.body.author,
      content: req.body.content,
      image: req.body.image || null
    };

    if(req.body.audioUrl) {
      formattedData.audio = {
        url: req.body.audioUrl,
        duration: req.body.audioDuration,
        size: req.body.audioSize
      };
    console.log("Formatted Tweet Data:", formattedData);
    }

    // Create the tweet
    const tweet = new Tweet(formattedData);
    await tweet.save();    
    const populatedTweet = await Tweet.findById(tweet._id).populate("author");
    
    // ==========================================
    // BACKEND KEYWORD DETECTION & LOGGING
    // ==========================================
    const tweetText = tweet.content?.toLowerCase() || ""; 
    
    if (tweetText.includes("cricket") || tweetText.includes("science")) {
      console.log("🚨 [DEBUG] Keyword detected in tweet:", tweetText);
      
      // Find ALL users who have notifications turned ON
      const usersToNotify = await User.find({ notificationEnabled: true });
      console.log(`🚨 [DEBUG] Found ${usersToNotify.length} users with notifications enabled.`);

      // Create the notification objects
      const notifications = usersToNotify.map(targetUser => ({
        recipient: targetUser._id,
        message: `Keyword Alert: ${populatedTweet.author.displayName} posted: "${tweet.content}"`
      }));

      // Save to database
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`🚨 [DEBUG] Successfully saved ${notifications.length} alerts to the database!`);
      } else {
        console.log("🚨 [DEBUG] Aborted saving: No users have notifications enabled right now.");
      }
    }
    // ==========================================
    
    return res.status(201).json(populatedTweet);
  } catch (error) {
    console.error("🚨 [DEBUG] Fatal error in /post route:", error.message);
    return res.status(400).json({ error: error.message });
  }
});


// app.delete("/post/:tweetid", async (req, res) => {
//   try {
//     const deletedTweet = await Tweet.findByIdAndDelete(req.params.tweetid);
//     if (!deletedTweet) {
//       return res.status(404).json({ error: "Tweet not found" });
//     }
//     return res.status(200).json({ message: "Tweet deleted successfully" });
//   } catch (error) {
//     return res.status(400).json({ error: error.message });
//   }
// });

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

// ==========================================
// DELETE A TWEET
// ==========================================
app.delete("/post/:tweetid", async (req, res) => {
  try {
    // Axios DELETE requests pass the body inside a 'data' object
    const { userId } = req.body; 
    
    // 1. Find the tweet first to verify ownership
    const tweet = await Tweet.findById(req.params.tweetid);
    
    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    // 2. Security Check: Ensure the requester is the author
    if (tweet.author.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own posts." });
    }
    await Tweet.findByIdAndDelete(req.params.tweetid);
    
    res.status(200).json({ message: "Tweet successfully deleted" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// NOTIFICATION ROUTES
// ==========================================

// GET notifications using the user's EMAIL
app.get("/notifications/:email", async (req, res) => {
  try {
    // 1. Find the MongoDB user using their email
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Fetch notifications using that user's valid MongoDB _id
    const notifications = await Notification.find({ recipient: user._id })
                                            .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST a new notification (used if you do local keyword detection)
app.post("/notifications", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Clear all notifications for a user
app.delete("/notifications/clear", async (req, res) => {
  try {
    const { userId } = req.body;
    await Notification.deleteMany({ recipient: userId });
    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// FORGOT PASSWORD ROUTE
// ==========================================

// 1. Password Generator Utility (A-Z, a-z, 0-9, Symbols)
const generateCustomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// 2. The Reset Endpoint
app.post("/forgot-password", async (req, res) => {
  try {
    const { identifier } = req.body; // Can be email or phone

    if (!identifier) {
      return res.status(400).json({ error: "Email or phone number is required" });
    }

    // Find the user by email OR phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // --- DAILY LIMIT CHECK ---
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison

    if (user.lastPasswordResetDate) {
      const lastReset = new Date(user.lastPasswordResetDate);
      lastReset.setHours(0, 0, 0, 0);

      // If the last reset was on the exact same calendar day...
      if (lastReset.getTime() === today.getTime()) {
         return res.status(429).json({ 
           error: "You can use this option only one time per day." 
         });
      }
    }
    // -------------------------

    // Generate the new password
    const newPassword = generateCustomPassword();

    try {
      // 1. Find the user in Firebase by their email
      const firebaseUser = await getAuth().getUserByEmail(user.email);
      
      // 2. Force update their password in Firebase
      await getAuth().updateUser(firebaseUser.uid, {
        password: newPassword
      });
      console.log("Successfully synced new password to Firebase");
    } catch (firebaseError) {
      console.error("Firebase Admin Error:", firebaseError);
      return res.status(500).json({ error: "Failed to sync password with authentication provider." });
    }
    // ==========================================

    // Update the database
    user.lastPasswordResetDate = new Date(); // Sets to right now
    user.passwordResetCount += 1;
    
    await user.save();

    res.status(200).json({
      message: "Password generated successfully",
      generatedPassword: newPassword
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


//Login History Route
app.post("/login-history", async (req, res) => {
  try {
    const{userId} = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    //parsing the user-agent string to get browser and OS info
    const userAgentString = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgentString);
    const result = parser.getResult();

    //extracting browser and operating system information
    const browser = parser.getBrowser().name || "unknown";
    const operatingSystem = parser.getOS().name || "unknown";

    const deviceType = result.device.type || "Desktop"; 

    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || "unknown";

    const location = "unknown";

    const historyRecord = new LoginHistory({
      userId,
      browser,
      operatingSystem,
      ipAddress,
      deviceType,
      location
    });

    await historyRecord.save();
    res.status(201).json({ message: "Login history recorded successfully", historyRecord });
    // console.log(`✅ Login Recorded | Browser: ${browser} | OS: ${operatingSystem} | Device: ${deviceType}`);
  } catch (error) {
    console.error("Login History Error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

app.get("/login-history/:userId", async (req, res) => {
  try {
    const histories = await LoginHistory.find({ userId: req.params.userId }).sort({ loginTime: -1 }).limit(10); // Fetch the last 10 login records
    res.status(200).json(histories);
  } catch (error) {
    console.error("Login History Error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});


// ==========================================
// AUDIO UPLOAD ROUTE (MULTER)
// ==========================================

// 1. Ensure the upload directory exists
const uploadDir = "public/uploads/audio";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure where and how to save the file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    // Saves as: 1689234512-filename.mp3 (removes spaces from original name)
    cb(null, uniqueSuffix + "-" + file.originalname.replace(/\s+/g, '-')); 
  }
});

// 3. Security: Only allow audio files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed!"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// 4. The actual POST route for the frontend to hit
app.post("/upload/audio", upload.single("audio"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded." });
    }
    
    // Create the URL that the frontend will use to play it
    const audioUrl = `/uploads/audio/${req.file.filename}`;
    
    res.status(200).json({ 
      message: "Audio uploaded successfully", 
      url: audioUrl 
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Failed to upload audio file." });
  }
});
