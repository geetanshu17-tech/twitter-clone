import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import multer from "multer";
import User from "./models/user.js";
import Tweet from "./models/tweet.js"; 
import Notification from "./models/notification.js";
import LoginHistory from "./models/loginHistory.js";
import {UAParser} from "ua-parser-js";
import Razorpay from "razorpay";
import crypto from "crypto";

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";



// // Read the JSON file safely
// const serviceAccount = JSON.parse(
//   fs.readFileSync(new URL("./firebaseServiceAccount.json", import.meta.url))
// );

// // Initialize Firebase Admin
// initializeApp({
//   credential: cert(serviceAccount)
// });

let serviceAccount;
if (process.env.FIREBASE_CREDENTIALS) {
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} else {
  serviceAccount = JSON.parse(
    fs.readFileSync(new URL("./firebaseServiceAccount.json", import.meta.url))
  );
}

initializeApp({
  credential: cert(serviceAccount)
});

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
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
      { returnDocument: 'after', upsert: false }
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
  console.log("Incoming Tweet Payload:", req.body);
  try {
    const authorId = req.body.author;
    
    const user = await User.findById(authorId);
    if (!user) {
      return res.status(404).json({ error: "Author not found" });
    }
    const tweetCount = await Tweet.countDocuments({ author: authorId });

    const planLimits = {
      FREE: 1,
      BRONZE: 3,
      SILVER: 5,
      GOLD: Infinity
    };

    // Safely get their plan (default to FREE if something is missing)
    const userPlan = (user.subscriptionPlan || "FREE").toUpperCase();
    const limit = planLimits[userPlan] || 1;

    if (tweetCount >= limit) {
      return res.status(403).json({ 
        error: `You've reached your ${userPlan} plan's posting limit. Upgrade your subscription to continue posting.` 
      });
    }
    // ==========================================

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
    // BACKEND KEYWORD DETECTION & LOGGING (Task 1)
    // ==========================================
    const tweetText = tweet.content?.toLowerCase() || ""; 
    
    if (tweetText.includes("cricket") || tweetText.includes("science")) {
      console.log("🚨 [DEBUG] Keyword detected in tweet:", tweetText);
      
      const usersToNotify = await User.find({ notificationEnabled: true });
      console.log(`🚨 [DEBUG] Found ${usersToNotify.length} users with notifications enabled.`);

      const notifications = usersToNotify.map(targetUser => ({
        recipient: targetUser._id,
        message: `Keyword Alert: ${populatedTweet.author.displayName} posted: "${tweet.content}"`
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`🚨 [DEBUG] Successfully saved ${notifications.length} alerts to the database!`);
      }
    }
    // ==========================================
    
    return res.status(201).json(populatedTweet);
  } catch (error) {
    console.error("🚨 [DEBUG] Fatal error in /post route:", error.message);
    return res.status(400).json({ error: error.message });
  }
});



// ==========================================
// 1. CREATE RAZORPAY ORDER (Phase 1 & 3)
// ==========================================
app.post("/create-order", async (req, res) => {
  try {
    // PHASE 3: TIME RESTRICTION (10 AM to 11 AM IST)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false 
    });
    const currentHourIST = parseInt(formatter.format(new Date()));

    if (currentHourIST !== 10) {
       return res.status(403).json({ error: "Payments are only accepted between 10:00 AM and 11:00 AM IST." });
    }

    const { amount } = req.body; 

    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
});

// ==========================================
// 2. VERIFY PAYMENT & UPGRADE PLAN (Phase 1 & 2)
// ==========================================
app.post("/verify-payment", async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      email, 
      newPlan 
    } = req.body;

    // 1. Verify the signature securely
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: "Invalid payment signature!" });
    }

    // 2. Signature is valid -> Activate Subscription (Phase 2)
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + 30); // 30 days validity

    user.subscriptionPlan = newPlan;
    user.planStartDate = startDate;
    user.planExpiryDate = expiryDate;
    user.paymentStatus = "paid";

    await user.save();


    const amountPaid = newPlan === "BRONZE" ? 100 : newPlan === "SILVER" ? 300 : 1000;

    try{
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Subscription Confirmed - Premium Receipt",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #3B82F6; text-align: center;">Subscription Confirmed!</h2>
            <p>Hi <strong>${user.displayName}</strong>,</p>
            <p>Thank you for upgrading your account. Your premium features are now active. Here are your invoice details:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Plan:</strong> ${newPlan}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${amountPaid}</p>
              <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
              <p style="margin: 5px 0;"><strong>Payment Date:</strong> ${startDate.toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Valid Until:</strong> ${expiryDate.toLocaleDateString()}</p>
            </div>
            
            <p style="text-align: center; color: #888; font-size: 12px;">© 2026 X Corp. All rights reserved.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ [DEBUG] Invoice email sent to ${user.email}`);
    } catch (emailError) {
      console.error("❌ [DEBUG] Failed to send invoice email:", emailError);
    }

    return res.status(200).json({
      message: "Payment verified and plan upgraded successfully!",
      user
    });


    } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


// ==========================================
// SEND LANGUAGE OTP (Phase 1)
// ==========================================
app.post("/send-language-otp", async (req, res) => {
  const { email, phone, targetLanguage } = req.body;

  try {
    // 1. Find the user to attach the OTP to their database record
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. Generate a 6-digit OTP and save it to the database
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = generatedOtp;
    user.otpExpires = new Date(Date.now() + 5 * 60000); // 5 minutes validity
    await user.save();

    // 3. Route the OTP based on the requested language
    if (targetLanguage === 'fr') {
      // 🇫🇷 FRENCH: Send Email OTP using your existing Nodemailer setup
      try {
        const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false }
      });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Language Verification Code",
          html: `<p>Your verification code to change your language to French is: <strong>${generatedOtp}</strong></p>`
        });
        console.log(`✅ [DEBUG] French Language OTP sent to ${email}`);
      } catch (emailErr) {
        console.error("Nodemailer error:", emailErr);
        // Fallback to terminal if email fails during dev
        console.log(`\n🚨 [FALLBACK EMAIL OTP] Email: ${email} | OTP: ${generatedOtp}\n`);
      }
    } else {
      console.log(`\n🚨 [MOBILE OTP GENERATED] Phone: ${phone || 'N/A'} | Target: ${targetLanguage.toUpperCase()} | OTP: ${generatedOtp}\n`);
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP Sending Error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// GET all tweets
app.get("/post", async (req, res) => {
  try {
    const tweets = await Tweet.find().sort({ timestamp: -1 }).populate("author");
    return res.status(200).json(tweets); 
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
      tweet.likes += 1;
      tweet.likedBy.push(userId);
    } else {
      tweet.likes = Math.max(0, tweet.likes - 1); 
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
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
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
      
      // Send specific, helpful messages back to the frontend
      if (firebaseError.code === 'auth/user-not-found') {
        return res.status(404).json({ error: "User not found in Firebase auth system." });
      } 
      if (firebaseError.code === 'auth/invalid-password') {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }
      
      // Fallback for any other Firebase issues
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
    // ==========================================
    // TASK 2: TIME RESTRICTION (2:00 PM to 7:00 PM IST)
    // ==========================================
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false 
    });
    const currentHourIST = parseInt(formatter.format(new Date()));

    // 14 = 2:00 PM, 19 = 7:00 PM
    if (currentHourIST < 14 || currentHourIST >= 19) {
      return res.status(403).json({ 
        error: "Audio uploads are restricted. You can only post audio tweets between 2:00 PM and 7:00 PM IST." 
      });
    }
    // ==========================================

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
