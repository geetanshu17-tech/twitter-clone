import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  avatar: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  website: { type: String, default: "" },
  
  joinedDate: { type: Date, default: Date.now },

  notificationEnabled: { type: Boolean, default: false },
  selectedLanguage: { type: String, default: "en" },

  phone: {
    type: String,
    default: "",
    trim: true,
  },
  
  // ==========================================
  // SUBSCRIPTION FIELDS (Updated for Case Safety)
  // ==========================================
  subscriptionPlan: { 
    type: String, 
    uppercase: true, // Automatically converts inputs like "free" -> "FREE" before saving
    enum: ["FREE", "BRONZE", "SILVER", "GOLD", "free", "bronze", "silver", "gold"], 
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
    default: "none" 
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
  otpExpiry: { type: Date, default: null },
  otpExpires: { type: Date, default: null } // Added to prevent crashes if backend refers to otpExpires
});

export default mongoose.model("User", UserSchema);