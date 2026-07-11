import mongoose from "mongoose";
const UserSchema = mongoose.Schema({
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  avatar: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  website: { type: String, default: "" },
  joinedDate: { type: Date, default: Date.now() },

  notificationEnabled: { type: Boolean, default: false },
  selectedLanguage: { type: String, default: "en" },
  subscriptionPlan: { type: String, default: "free" },

  phone: { 
    type: String, 
    unique: true, 
    sparse: true // sparse allows multiple users to have a 'null' phone number without throwing a unique error
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
  otpExpiry: { type: Date, default: null }
});

export default mongoose.model("User", UserSchema);