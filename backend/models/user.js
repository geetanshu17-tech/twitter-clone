import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  avatar: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  website: { type: String, default: "" },
  
  // Fixed the Date.now bug by removing ()
  joinedDate: { type: Date, default: Date.now },

  notificationEnabled: { type: Boolean, default: false },
  selectedLanguage: { type: String, default: "en" },
  
  // ==========================================
  // SUBSCRIPTION FIELDS (Task 4)
  // ==========================================
  subscriptionPlan: { 
    type: String, 
    enum: ["FREE", "BRONZE", "SILVER", "GOLD"], // Strictly limits allowed values
    default: "FREE" 
  },
  planStartDate: { 
    type: Date, 
    default: null 
  },
  planExpiryDate: { 
    type: Date, 
    default: null 
  },
  paymentStatus: { 
    type: String, 
    default: "none" // Can be updated to "paid", "pending", etc. when Razorpay is added
  },
  // ==========================================

  phone: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  passwordResetCount: { 
    type: Number, 
    default: 0 
  },
  lastPasswordResetDate: { 
    type: Date, 
    default: null
  },

  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null } // I noticed you used otpExpires in index.js earlier, ensure these match!
});

export default mongoose.model("User", UserSchema);