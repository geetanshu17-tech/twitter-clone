"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase";
import i18n from "@/i18n";
import axiosInstance from "../lib/axiosInstance";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  email: string;
  website: string;
  location: string;
  notificationEnabled?: boolean;
  subscriptionPlan?: string;
  planStartDate?: Date | string;
  planExpiryDate?: Date | string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => Promise<void>;
  updateProfile: (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  googlesignin: () => void;
  pendingOtpEmail: string | null;
  setPendingOtpEmail: (email: string | null) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOtpEmail, setPendingOtpEmail] = useState<string | null>(null); 
  const router = useRouter();


  useEffect(() => {
    const unsubcribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.email) {
        try {
          // 1. Check if the user is already saved in local storage
          const existingSession = localStorage.getItem("twitter-user");

          // 2. If no session exists, it's a FRESH login. 
          // Stop here! Let your login() or googlesignin() functions handle the OTP flow.
          if (!existingSession) {
            setIsLoading(false);
            return; 
          }

          // 3. If a session DOES exist, it's a page refresh. 
          // Safe to fetch the user and explicitly tell the backend to skip the OTP.
          const res = await axiosInstance.get("/loggedinuser", {
            params: { email: firebaseUser.email, skipOtp: true },
          });

          if (res.data) {
            setUser(res.data);
            localStorage.setItem("twitter-user", JSON.stringify(res.data));

            localStorage.setItem("i18nextLng", res.data.selectedLanguage || "en");
          }
        } catch (err) {
          console.log("Failed to fetch user on refresh:", err);
        }
      } else {
        setUser(null);
        localStorage.removeItem("twitter-user");
      }
      setIsLoading(false);
    });
    return () => unsubcribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log("starting login.......");
    try {
      const usercred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseuser = usercred.user;
      console.log("firebase login successful");
      
      const res = await axiosInstance.get("/loggedinuser", {
        params: { email: firebaseuser.email },
      });
      console.log("backend login successful", res.status);
      
      // NEW: Chrome OTP Check
      if (res.status === 206 && res.data.requiresOtp) {
        console.log("4. Hit the OTP Block! Opening Modal...");
        setPendingOtpEmail(res.data.email);
        setIsLoading(false);
        return; // Stop here, wait for OtpModal
      }
      
      if (res.data) {
        console.log("4. Hit the Success Block! Redirecting...");
        setUser(res.data);
        localStorage.setItem("twitter-user", JSON.stringify(res.data));

        localStorage.setItem("i18nextLng", res.data.selectedLanguage || "en");

        const userLang = res.data.selectedLanguage || "en";
        localStorage.setItem("i18nextLng", userLang);
        i18n.changeLanguage(userLang); 
        
        try {
          await axiosInstance.post("/login-history", { userId: res.data._id });
        } catch (historyErr) {
          console.error("Failed to record login history", historyErr);
        }
        
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error)) {
        // Handles backend/MongoDB errors safely
        alert(error.response?.data?.error || error.response?.data?.message || "Server Error");
      } else if (error instanceof Error) {
        // 🚨 NEW: Proves to TypeScript this is a standard Error (like Firebase)
        alert(error.message);
      } else {
        // Ultimate fallback for completely unknown types
        alert("An unknown error occurred");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => {
    setIsLoading(true);
    // Mock authentication - in real app, this would call an API
    const usercred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = usercred.user;
    const newuser: any = {
      username,
      displayName,
      avatar: user.photoURL || "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400",
      email: user.email,
    };
    const res = await axiosInstance.post("/register", newuser);
    if (res.data) {
      setUser(res.data);
      localStorage.setItem("twitter-user", JSON.stringify(res.data));
    }
    // const mockUser: User = {
    //   id: '1',
    //   username,
    //   displayName,
    //   avatar: 'https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400',
    //   bio: '',
    //   joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    // };
    setIsLoading(false);
  };

  const logout = async () => {
    setUser(null);
    await signOut(auth);
    localStorage.removeItem("twitter-user");
    localStorage.removeItem("i18nextLng");
    i18n.changeLanguage("en");
  };

  const updateProfile = async (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => {
    if (!user) return;

    setIsLoading(true);

    const updatedUser: User = {
      ...user,
      ...profileData,
    };
    const res = await axiosInstance.patch(
      `/userupdate/${user.email}`,
      updatedUser
    );
    if (res.data) {
      setUser(updatedUser);
      localStorage.setItem("twitter-user", JSON.stringify(updatedUser));
    }

    setIsLoading(false);
  };
  const googlesignin = async () => {
    setIsLoading(true);

    try {
      const googleauthprovider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleauthprovider);
      const firebaseuser = result.user;

      if (!firebaseuser?.email) {
        throw new Error("No email found in Google account");
      }

      let userData;

      try {
        const res = await axiosInstance.get("/loggedinuser", {
          params: { email: firebaseuser.email },
        });

        // If the backend sent a 206 status, it means Chrome was detected
        if (res.status === 206 && res.data.requiresOtp) {
          setPendingOtpEmail(res.data.email);
          setIsLoading(false);
          return; // Stop here, do not log them in yet!
        }

        // Otherwise, proceed as normal
        if (res.data) {
          setUser(res.data);
          localStorage.setItem("twitter-user", JSON.stringify(res.data));
          await axiosInstance.post("/login-history", { userId: res.data._id });
        }
        userData = res.data;
      } catch (err: any) {
        const newuser: any = {
          username: firebaseuser.email.split("@")[0],
          displayName: firebaseuser.displayName || "User",
          avatar: firebaseuser.photoURL || "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400",
          email: firebaseuser.email,
        };

        const registerRes = await axiosInstance.post("/register", newuser);
        userData = registerRes.data;
      }

      if (userData) {
        setUser(userData);
        localStorage.setItem("twitter-user", JSON.stringify(userData));

        localStorage.setItem("i18nextLng", userData.selectedLanguage || "en");
        const userLang = userData.selectedLanguage || "en";
        localStorage.setItem("i18nextLng", userLang);
        i18n.changeLanguage(userLang);
        
        try {
          await axiosInstance.post("/login-history", { userId: userData._id });
        } catch (historyErr) {
          console.error("Failed to record Google login history", historyErr);
        }
        
        router.push("/");

      } else {
        throw new Error("Login/Register failed: No user data returned");
      }
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        console.log("Popup closed. Awaiting user intent.");
        return; // Exit the function quietly
      }
      // ==========================================

      console.error("Google Sign-In Error:", error);
      alert(error.response?.data?.message || error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        signup,
        updateProfile,
        logout,
        isLoading,
        googlesignin,
        pendingOtpEmail,
        setPendingOtpEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};