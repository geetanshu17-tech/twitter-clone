"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link as LinkIcon,
  MoreHorizontal,
  Camera,
  Loader2,
  LogOut,
  Globe,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import LoginHistorySection from "@/app/login-history-profile/page";

import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";

import TweetCard from "./TweetCard";
import Editprofile from "./Editprofile";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("posts");
  const [showEditModal, setShowEditModal] = useState(false);

  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Mobile Language OTP State ---
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleLanguageSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    if (!user) return;
    setPendingLanguage(selectedLang);

    try {
      const currentUser = user as any;
      await axiosInstance.post("/send-language-otp", {
        targetLanguage: selectedLang,
        email: currentUser.email,
        phone: currentUser.phone,
      });
      setShowOtpModal(true);
    } catch (error) {
      console.error("Failed to trigger OTP");
    }
  };

  const handleVerifyLanguageOtp = async () => {
    setOtpError("");
    try {
      const currentUser = user as any;
      await axiosInstance.post("/verify-otp", {
        email: currentUser.email,
        otp: otpInput,
        targetLanguage: pendingLanguage,
      });

      i18n.changeLanguage(pendingLanguage);
      setShowOtpModal(false);
      setOtpInput("");
    } catch (err: any) {
      setOtpError("Invalid OTP. Please try again.");
    }
  };

  // --- Subscription Logic ---
  const formattedExpiry = user?.planExpiryDate
    ? new Date(user.planExpiryDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const currentPlan = (user?.subscriptionPlan || "FREE").toUpperCase();
  const isPremium = currentPlan !== "FREE";

  if (!user) return null;

  const fetchTweets = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/post");
      setTweets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const userTweets = tweets.filter(
    (tweet: any) => tweet.author._id === user._id
  );

  return (
    <div className="mx-auto min-h-screen max-w-2xl border-x border-zinc-800 bg-black">
      {/* ================= Header ================= */}
      <div className="sticky top-0 z-30 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-zinc-900"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">{user.displayName}</h1>
              <p className="text-sm text-zinc-500">{userTweets.length} Posts</p>
            </div>
          </div>

          {/* LOGOUT BUTTON (Crucial for Mobile View) */}
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="rounded-full border-red-800 text-red-500 hover:bg-red-950/50 hover:text-red-400 font-bold flex items-center gap-1.5 px-4"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("logout") || "Log out"}</span>
          </Button>
        </div>
      </div>

      {/* ================= Cover ================= */}
      <section className="relative">
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-full bg-black/50 hover:bg-black/70"
          >
            <Camera className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-16 sm:-bottom-20 left-4 sm:left-5">
          <div className="relative">
            <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-[4px] sm:border-[5px] border-black shadow-2xl">
              <AvatarImage src={user.avatar} alt={user.displayName} className="object-cover" />
              <AvatarFallback className="text-3xl font-bold">
                {user.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 rounded-full bg-black/70 hover:bg-black"
            >
              <Camera className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="flex justify-end px-4 sm:px-5 py-4">
          <Button
            onClick={() => setShowEditModal(true)}
            variant="outline"
            className="rounded-full border-zinc-700 bg-black px-5 sm:px-6 font-semibold text-white transition-all hover:bg-zinc-900"
          >
            {t("editProfile")}
          </Button>
        </div>
      </section>

      {/* ================= Profile Info ================= */}
      <section className="px-4 sm:px-5 pt-16 sm:pt-20 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {user.displayName}
            </h1>
            <p className="mt-0.5 text-sm sm:text-[15px] text-zinc-500">@{user.username}</p>
          </div>
        </div>

        {/* Bio */}
        {user.bio ? (
          <p className="mt-4 whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed text-white">
            {user.bio}
          </p>
        ) : (
          <p className="mt-4 text-sm sm:text-[15px] italic text-zinc-500">No bio yet.</p>
        )}

        {/* Info */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 text-xs sm:text-[15px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>{user.location || "Earth"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <LinkIcon className="h-4 w-4" />
            <span className="cursor-pointer text-sky-500 hover:underline">
              {user.website || "example.com"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>
              Joined{" "}
              {user.joinedDate
                ? new Date(user.joinedDate).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "Recently"}
            </span>
          </div>
        </div>

        {/* Followers */}
        <div className="mt-5 flex items-center gap-6 text-sm sm:text-base">
          <button className="group">
            <span className="font-bold text-white">245</span>
            <span className="ml-1 text-zinc-500 group-hover:underline">
              {t("following")}
            </span>
          </button>
          <button className="group">
            <span className="font-bold text-white">1.3K</span>
            <span className="ml-1 text-zinc-500 group-hover:underline">
              {t("followers")}
            </span>
          </button>
        </div>
      </section>

      {/* ================= Premium Subscription Card ================= */}
      <div className="mx-4 sm:mx-5 mb-5 p-4 sm:p-5 border border-zinc-800 rounded-2xl bg-gradient-to-br from-sky-500/10 to-transparent">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-white">Current Subscription</h2>
          {isPremium && (
            <span className="bg-sky-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Active
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs sm:text-sm text-zinc-500">Plan</p>
            <p className="text-xl sm:text-2xl font-black text-sky-500 tracking-tight">
              {currentPlan}
            </p>
            {isPremium && (
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Valid Until:{" "}
                <span className="font-semibold text-white">
                  {formattedExpiry}
                </span>
              </p>
            )}
          </div>

          <Link
            href="/subscriptions"
            className="inline-flex items-center justify-center px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-colors"
          >
            {isPremium ? "Change Plan" : "Upgrade Now"}
          </Link>
        </div>
      </div>

      {/* ================= Mobile Language Selector ================= */}
      <div className="mx-4 sm:mx-5 mb-6 p-4 sm:p-5 border border-zinc-800 rounded-2xl bg-[#16181c]">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-5 w-5 text-sky-500" />
          <h3 className="text-base sm:text-lg font-bold text-white">{t("language") || "Language"}</h3>
        </div>
        <select
          value={i18n.resolvedLanguage}
          onChange={handleLanguageSelect}
          className="w-full bg-black text-white p-3 rounded-xl border border-zinc-700 outline-none focus:border-sky-500 text-sm appearance-none cursor-pointer"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="es">Español (Spanish)</option>
          <option value="pt">Português (Portuguese)</option>
          <option value="zh">中文 (Chinese)</option>
          <option value="fr">Français (French)</option>
          <option value="de">Deutsch (German)</option>
          <option value="ja">日本語 (Japanese)</option>
        </select>
      </div>

      {/* ================= Tabs ================= */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full overflow-x-auto no-scrollbar md:grid h-14 md:grid-cols-6 rounded-none border-b border-zinc-800 bg-black p-0">
          <TabsTrigger value="posts" className="shrink-0 px-4 md:px-0 relative h-full rounded-none border-0 bg-transparent text-sm font-semibold text-zinc-500 hover:text-white data-[state=active]:text-white after:absolute after:bottom-0 after:left-2 after:right-2 md:after:left-5 md:after:right-5 after:h-1 after:rounded-full after:bg-transparent data-[state=active]:after:bg-sky-500">
            {t("posts")}
          </TabsTrigger>
          <TabsTrigger value="replies" className="shrink-0 px-4 md:px-0 relative h-full rounded-none bg-transparent text-sm font-semibold text-zinc-500 hover:text-white data-[state=active]:text-white after:absolute after:bottom-0 after:left-2 after:right-2 md:after:left-5 md:after:right-5 after:h-1 after:rounded-full after:bg-transparent data-[state=active]:after:bg-sky-500">
            {t("replies")}
          </TabsTrigger>
          <TabsTrigger value="highlights" className="shrink-0 px-4 md:px-0 relative h-full rounded-none bg-transparent text-sm font-semibold text-zinc-500 hover:text-white data-[state=active]:text-white after:absolute after:bottom-0 after:left-2 after:right-2 md:after:left-5 md:after:right-5 after:h-1 after:rounded-full after:bg-transparent data-[state=active]:after:bg-sky-500">
            {t("highlights")}
          </TabsTrigger>
          <TabsTrigger value="articles" className="shrink-0 px-4 md:px-0 relative h-full rounded-none bg-transparent text-sm font-semibold text-zinc-500 hover:text-white data-[state=active]:text-white after:absolute after:bottom-0 after:left-2 after:right-2 md:after:left-5 md:after:right-5 after:h-1 after:rounded-full after:bg-transparent data-[state=active]:after:bg-sky-500">
            {t("articles")}
          </TabsTrigger>
          <TabsTrigger value="media" className="shrink-0 px-4 md:px-0 relative h-full rounded-none bg-transparent text-sm font-semibold text-zinc-500 hover:text-white data-[state=active]:text-white after:absolute after:bottom-0 after:left-2 after:right-2 md:after:left-5 md:after:right-5 after:h-1 after:rounded-full after:bg-transparent data-[state=active]:after:bg-sky-500">
            {t("media")}
          </TabsTrigger>
          <TabsTrigger value="security" className="shrink-0 px-4 md:px-0 relative h-full rounded-none bg-transparent text-sm font-semibold text-zinc-500 hover:text-white data-[state=active]:text-white after:absolute after:bottom-0 after:left-2 after:right-2 md:after:left-5 md:after:right-5 after:h-1 after:rounded-full after:bg-transparent data-[state=active]:after:bg-sky-500">
            {t("security")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0 focus-visible:outline-none">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
          ) : userTweets.length === 0 ? (
            <Card className="rounded-none border-x-0 border-b-0 border-t-0 border-zinc-800 bg-black shadow-none">
              <CardContent className="flex flex-col items-center py-20">
                <h2 className="text-2xl font-extrabold text-white">
                  You haven't posted yet
                </h2>
                <p className="mt-2 max-w-sm text-center text-sm text-zinc-500">
                  Your posts will appear here once you share something.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="divide-y divide-zinc-800">
              {userTweets.map((tweet: any) => (
                <div key={tweet._id} className="transition-colors duration-200 hover:bg-zinc-950">
                  <TweetCard tweet={tweet} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="replies" className="mt-0">
          <Card className="rounded-none border-0 bg-black shadow-none">
            <CardContent className="flex flex-col items-center py-16">
              <h2 className="text-xl font-bold text-white">No replies yet</h2>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="highlights" className="mt-0">
          <Card className="rounded-none border-0 bg-black shadow-none">
            <CardContent className="flex flex-col items-center py-16">
              <h2 className="text-xl font-bold text-white">Nothing to highlight</h2>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="mt-0">
          <Card className="rounded-none border-0 bg-black shadow-none">
            <CardContent className="flex flex-col items-center py-16">
              <h2 className="text-xl font-bold text-white">No articles yet</h2>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-0">
          <Card className="rounded-none border-0 bg-black shadow-none">
            <CardContent className="flex flex-col items-center py-16">
              <h2 className="text-xl font-bold text-white">No media yet</h2>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-0 p-4 sm:p-5">
          <LoginHistorySection />
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      <Editprofile
        isopen={showEditModal}
        onclose={() => setShowEditModal(false)}
      />

      {/* Language OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#16181c] p-6 border border-zinc-800 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Verify Language Change</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Enter the 6-digit code sent to you to confirm this change.
            </p>

            <input
              type="text"
              maxLength={6}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="Enter OTP"
              className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-center text-xl tracking-widest text-white focus:border-sky-500 focus:outline-none mb-3"
            />

            {otpError && <p className="text-red-500 text-sm text-center mb-3">{otpError}</p>}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 rounded-full border-zinc-700 bg-transparent text-white hover:bg-zinc-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyLanguageOtp}
                disabled={otpInput.length < 6}
                className="flex-1 rounded-full bg-white text-black hover:bg-zinc-200 font-bold"
              >
                Verify
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}