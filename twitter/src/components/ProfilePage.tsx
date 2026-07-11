"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link as LinkIcon,
  MoreHorizontal,
  Camera,
  Loader2,
} from "lucide-react";

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
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("posts");
  const [showEditModal, setShowEditModal] = useState(false);

  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

        <div className="flex items-center gap-5 px-5 py-3">

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-zinc-900"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>

          <div>

            <h1 className="text-xl font-bold text-white">
              {user.displayName}
            </h1>

            <p className="text-sm text-zinc-500">
              {userTweets.length} Posts
            </p>

          </div>

        </div>

      </div>
      

      {/* ================= Cover ================= */}

      <section className="relative">

        <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700">

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-full bg-black/50 hover:bg-black/70"
          >
            <Camera className="h-5 w-5 text-white" />
          </Button>

        </div>

        {/* Avatar */}

        <div className="absolute -bottom-20 left-5">

          <div className="relative">

            <Avatar className="h-40 w-40 border-[5px] border-black shadow-2xl">

              <AvatarImage
                src={user.avatar}
                alt={user.displayName}
              />

              <AvatarFallback className="text-4xl font-bold">
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

        {/* Edit Button */}

        <div className="flex justify-end px-5 py-4">

          <Button
            onClick={() => setShowEditModal(true)}
            variant="outline"
            className="rounded-full border-zinc-700 bg-black px-6 font-semibold text-white transition-all hover:bg-zinc-900"
          >
            Edit profile
          </Button>

        </div>

      </section>

      {/* ================= Profile Info ================= */}

      <section className="px-5 pt-20 pb-6">

        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {user.displayName}
            </h1>

            <p className="mt-1 text-[15px] text-zinc-500">
              @{user.username}
            </p>

          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full transition-colors hover:bg-zinc-900"
          >
            <MoreHorizontal className="h-5 w-5 text-zinc-400" />
          </Button>

        </div>

        {/* Bio */}

        {user.bio ? (
          <p className="mt-5 whitespace-pre-wrap text-[15px] leading-7 text-white">
            {user.bio}
          </p>
        ) : (
          <p className="mt-5 text-[15px] italic text-zinc-500">
            No bio yet.
          </p>
        )}

        {/* Info */}

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-[15px] text-zinc-500">

          <div className="flex items-center gap-2">

            <MapPin className="h-4 w-4" />

            <span>
              {user.location || "Earth"}
            </span>

          </div>

          <div className="flex items-center gap-2">

            <LinkIcon className="h-4 w-4" />

            <span className="cursor-pointer text-sky-500 transition-colors hover:text-sky-400 hover:underline">
              {user.website || "example.com"}
            </span>

          </div>

          <div className="flex items-center gap-2">

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

        <div className="mt-6 flex items-center gap-8">

          <button className="group">

            <span className="font-bold text-white">
              245
            </span>

            <span className="ml-1 text-zinc-500 group-hover:underline">
              Following
            </span>

          </button>

          <button className="group">

            <span className="font-bold text-white">
              1.3K
            </span>

            <span className="ml-1 text-zinc-500 group-hover:underline">
              Followers
            </span>

          </button>

        </div>

      </section>

      {/* ================= Tabs ================= */}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid h-14 w-full grid-cols-6 rounded-none border-b border-zinc-800 bg-black p-0">

          <TabsTrigger
            value="posts"
            className="
      relative
      h-full
      rounded-none
      border-0
      bg-transparent
      text-sm
      font-semibold
      text-zinc-500
      transition-all
      duration-200
      hover:bg-zinc-900
      hover:text-white
      data-[state=active]:bg-transparent
      data-[state=active]:text-white
      after:absolute
      after:bottom-0
      after:left-5
      after:right-5
      after:h-1
      after:rounded-full
      after:bg-transparent
      data-[state=active]:after:bg-sky-500
      "
          >
            Posts
          </TabsTrigger>

          <TabsTrigger
            value="replies"
            className="
      relative
      h-full
      rounded-none
      bg-transparent
      text-sm
      font-semibold
      text-zinc-500
      transition-all
      duration-200
      hover:bg-zinc-900
      hover:text-white
      data-[state=active]:bg-transparent
      data-[state=active]:text-white
      after:absolute
      after:bottom-0
      after:left-5
      after:right-5
      after:h-1
      after:rounded-full
      after:bg-transparent
      data-[state=active]:after:bg-sky-500
      "
          >
            Replies
          </TabsTrigger>

          <TabsTrigger
            value="highlights"
            className="
      relative
      h-full
      rounded-none
      bg-transparent
      text-sm
      font-semibold
      text-zinc-500
      transition-all
      duration-200
      hover:bg-zinc-900
      hover:text-white
      data-[state=active]:bg-transparent
      data-[state=active]:text-white
      after:absolute
      after:bottom-0
      after:left-5
      after:right-5
      after:h-1
      after:rounded-full
      after:bg-transparent
      data-[state=active]:after:bg-sky-500
      "
          >
            Highlights
          </TabsTrigger>

          <TabsTrigger
            value="articles"
            className="
      relative
      h-full
      rounded-none
      bg-transparent
      text-sm
      font-semibold
      text-zinc-500
      transition-all
      duration-200
      hover:bg-zinc-900
      hover:text-white
      data-[state=active]:bg-transparent
      data-[state=active]:text-white
      after:absolute
      after:bottom-0
      after:left-5
      after:right-5
      after:h-1
      after:rounded-full
      after:bg-transparent
      data-[state=active]:after:bg-sky-500
      "
          >
            Articles
          </TabsTrigger>

          <TabsTrigger
            value="media"
            className="
      relative
      h-full
      rounded-none
      bg-transparent
      text-sm
      font-semibold
      text-zinc-500
      transition-all
      duration-200
      hover:bg-zinc-900
      hover:text-white
      data-[state=active]:bg-transparent
      data-[state=active]:text-white
      after:absolute
      after:bottom-0
      after:left-5
      after:right-5
      after:h-1
      after:rounded-full
      after:bg-transparent
      data-[state=active]:after:bg-sky-500
      "
          >
            Media
          </TabsTrigger>
          
          <TabsTrigger
            value="security"
            className="
              relative h-full rounded-none bg-transparent text-sm font-semibold text-zinc-500 transition-all duration-200
              hover:bg-zinc-900 hover:text-white data-[state=active]:bg-transparent data-[state=active]:text-white
              after:absolute after:bottom-0 after:left-5 after:right-5 after:h-1 after:rounded-full after:bg-transparent
              data-[state=active]:after:bg-sky-500
            "
          >
            Security
          </TabsTrigger>
        </TabsList>

        {/* ================= Posts ================= */}

        <TabsContent
          value="posts"
          className="mt-0 focus-visible:outline-none"
        >

          {loading ? (

            <div className="flex items-center justify-center py-20">

              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />

            </div>

          ) : userTweets.length === 0 ? (

            <Card className="rounded-none border-x-0 border-b-0 border-t-0 border-zinc-800 bg-black shadow-none">

              <CardContent className="flex flex-col items-center py-20">

                <h2 className="text-3xl font-extrabold text-white">
                  You haven't posted yet
                </h2>

                <p className="mt-3 max-w-sm text-center text-zinc-500">
                  Your posts will appear here once you share something with everyone.
                </p>

              </CardContent>

            </Card>

          ) : (

            <div className="divide-y divide-zinc-800">

              {userTweets.map((tweet: any) => (

                <div
                  key={tweet._id}
                  className="transition-colors duration-200 hover:bg-zinc-950"
                >
                  <TweetCard tweet={tweet} />
                </div>

              ))}

            </div>

          )}

        </TabsContent>

  {/* ================= Replies ================= */}

  <TabsContent value="replies" className="mt-0">

    <Card className="rounded-none border-x-0 border-b-0 border-t-0 border-zinc-800 bg-black shadow-none">

      <CardContent className="flex flex-col items-center py-20">

        <h2 className="text-3xl font-extrabold text-white">
          No replies yet
        </h2>

        <p className="mt-3 max-w-sm text-center text-zinc-500">
          When you reply to someone's post, it'll appear here.
        </p>

      </CardContent>

    </Card>

  </TabsContent>

  {/* ================= Highlights ================= */}

  <TabsContent value="highlights" className="mt-0">

    <Card className="rounded-none border-x-0 border-b-0 border-t-0 border-zinc-800 bg-black shadow-none">

      <CardContent className="flex flex-col items-center py-20">

        <h2 className="text-3xl font-extrabold text-white">
          Nothing to highlight
        </h2>

        <p className="mt-3 max-w-sm text-center text-zinc-500">
          Posts you choose to highlight will appear here.
        </p>

      </CardContent>

    </Card>

  </TabsContent>

  {/* ================= Articles ================= */}

  <TabsContent value="articles" className="mt-0">

    <Card className="rounded-none border-x-0 border-b-0 border-t-0 border-zinc-800 bg-black shadow-none">

      <CardContent className="flex flex-col items-center py-20">

        <h2 className="text-3xl font-extrabold text-white">
          No articles yet
        </h2>

        <p className="mt-3 max-w-sm text-center text-zinc-500">
          Published articles will appear here.
        </p>

      </CardContent>

    </Card>

  </TabsContent>

  {/* ================= Media ================= */}

  <TabsContent value="media" className="mt-0">

    <Card className="rounded-none border-x-0 border-b-0 border-t-0 border-zinc-800 bg-black shadow-none">

      <CardContent className="flex flex-col items-center py-20">

        <h2 className="text-3xl font-extrabold text-white">
          No media yet
        </h2>

        <p className="mt-3 max-w-sm text-center text-zinc-500">
          Photos and videos from your posts will appear here.
        </p>

      </CardContent>

    </Card>

  </TabsContent>
  <TabsContent value="security" className="mt-0 p-5">
           <LoginHistorySection />
  </TabsContent>

</Tabs>

{/* ================= Edit Profile ================= */}

<Editprofile
  isopen={showEditModal}
  onclose={() => setShowEditModal(false)}
/>

</div>
);
}        