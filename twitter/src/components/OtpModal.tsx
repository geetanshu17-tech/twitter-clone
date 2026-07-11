"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {useRouter} from "next/navigation";

export default function OtpModal() {
  const { pendingOtpEmail, setPendingOtpEmail, setUser } = useAuth();
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If there is no pending email, don't show the modal at all
  if (!pendingOtpEmail) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Send OTP to backend for verification
      const res = await axiosInstance.post("/verify-otp", {
        email: pendingOtpEmail,
        otp: otp,
      });

      if (res.data) {
        // 2. Success! Log the user in fully
        setUser(res.data);
        localStorage.setItem("twitter-user", JSON.stringify(res.data));
        
        // 3. Record the successful login history
        await axiosInstance.post("/login-history", { userId: res.data._id });

        // 4. Close the modal
        setPendingOtpEmail(null);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-zinc-950 p-6 shadow-2xl border border-zinc-800">
        <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-sm text-zinc-400 mb-6">
          For your security on Chrome, we require a 6-digit verification code sent to {pendingOtpEmail}.
        </p>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-center text-2xl tracking-widest text-white focus:border-sky-500 focus:outline-none"
            required
          />

          {error && <p className="mt-3 text-sm text-red-500 text-center">{error}</p>}

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingOtpEmail(null)} // Cancel login
              className="flex-1 rounded-full border-zinc-700 bg-transparent text-white hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              className="flex-1 rounded-full bg-white text-black hover:bg-zinc-200 font-bold"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Log In"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}