"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import LoadingSpinner from "./loading-spinner";
import TweetCard from "./TweetCard";
import TweetComposer from "./TweetComposer";
import axiosInstance from "@/lib/axiosInstance";

const Feed = () => {
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setloading] = useState(false);

  const fetchTweets = async () => {
    try {
      setloading(true);
      const res = await axiosInstance.get("/post");
      setTweets(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const handlenewtweet = (newtweet: any) => {
    setTweets((prev: any) => [newtweet, ...prev]);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      
      {/* Authentic X Sticky Header with Tabs */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 z-10 flex flex-col pt-2">
        <Tabs defaultValue="foryou" className="w-full">
          <TabsList className="flex w-full bg-transparent border-none rounded-none h-[53px] p-0">
            
            <TabsTrigger
              value="foryou"
              className="group relative flex-1 h-full rounded-none bg-transparent  hover:text-white text-gray-500 hover:bg-white/10 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none outline-none cursor-pointer transition-colors"
            >
              <div className="relative inline-flex h-full items-center justify-center font-bold text-[15px]">
                For you
                
                <div className="absolute bottom-0 left-0 right-0 hidden h-[4px] rounded-t-full bg-blue-500 group-data-[state=active]:block" />
              </div>
            </TabsTrigger>
            
            <TabsTrigger
              value="following"
              className="group relative flex-1 h-full rounded-none bg-transparent hover:text-white text-gray-500 hover:bg-white/10 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none outline-none cursor-pointer transition-colors"
            >
              <div className="relative inline-flex h-full items-center justify-center font-bold text-[15px]">
                Following
                <div className="absolute bottom-0 left-0 right-0 hidden h-[4px] rounded-t-full bg-blue-500 group-data-[state=active]:block" />
              </div>
            </TabsTrigger>

          </TabsList>
        </Tabs>
      </div>

      {/* Composer Section */}
      <div className="border-b border-gray-800">
        <TweetComposer onTweetPosted={handlenewtweet} />
      </div>

      {/* Feed List */}
      <div className="w-full">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-500 space-y-4">
            <LoadingSpinner size="lg" className="mx-auto" />
          </div>
        ) : tweets.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-bold text-lg">
            Welcome to X! Be the first to post.
          </div>
        ) : (
          tweets.map((tweet: any) => (
            <TweetCard key={tweet._id} tweet={tweet} />
          ))
        )}
      </div>

    </div>
  );
};

export default Feed;