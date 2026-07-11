"use client";
import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import TwitterLogo from "@/components/Twitterlogo"; // Adjust path if needed

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedPassword("");

    try {
      const res = await axios.post("http://localhost:5000/forgot-password", {
        identifier,
      });

      // Show the password returned from the backend
      setGeneratedPassword(res.data.generatedPassword);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 429) {
        setError(err.response.data.error); // "You can use this option only one time per day."
      } else if (err.response?.status === 404) {
        setError("No account found with that email or phone number.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 text-white">
      <div className="max-w-md w-full bg-black border border-gray-800 rounded-2xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <TwitterLogo size="md" className="mx-auto text-white" />
          <h1 className="text-3xl font-bold">Find your account</h1>
          <p className="text-gray-500 text-sm">
            Enter the email or phone number associated with your account to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Email or phone number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-transparent border border-gray-700 rounded-md p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Success / Display Password */}
          {generatedPassword && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-md space-y-2 text-center">
              <p className="text-green-500 text-sm font-medium">Password generated successfully!</p>
              <p className="text-gray-400 text-xs">Please copy and save this new password:</p>
              <div className="bg-black border border-gray-700 p-3 rounded text-xl font-mono text-white tracking-wider break-all">
                {generatedPassword}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!generatedPassword && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold rounded-full p-3 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Reset Password"}
            </button>
          )}
        </form>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <Link href="/" className="text-blue-500 hover:underline text-sm">
            Return to Login
          </Link>
        </div>

      </div>
    </div>
  );
}