"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
  Trash2 
} from "lucide-react";

import { useAuth } from "@/context/AuthContext"; 
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "./ui/button";

const defaultMockTweet = {
  id: "mock-1",
  content: "Building an awesome frontend-only Twitter/X clone using Next.js, Tailwind, and Shadcn UI! 🚀 #webdev",
  image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60", 
  likes: 42,
  retweets: 12,
  comments: 5,
  likedBy: [],
  retweetedBy: [],
  timestamp: new Date().toISOString(),
  author: {
    displayName: "Jane Doe",
    username: "janedoe_dev",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    verified: true,
  },
};

export default function TweetCard({ tweet }: { tweet?: any }) {
  const { user } = useAuth();
  const initialTweetData = tweet ? { ...defaultMockTweet, ...tweet } : defaultMockTweet;

  const [tweetstate, settweetstate] = useState({
    ...initialTweetData,
    likedBy: initialTweetData.likedBy || [],
    retweetedBy: initialTweetData.retweetedBy || [],
  });

  const [isDeleted, setIsDeleted] = useState(false);

  const likeTweet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return; 

    const isLiked = tweetstate.likedBy.includes(user._id);

    settweetstate((prev: any) => ({
      ...prev,
      likes: isLiked ? prev.likes - 1 : prev.likes + 1,
      likedBy: isLiked
        ? prev.likedBy.filter((id: string) => id !== user._id)
        : [...prev.likedBy, user._id],
    }));

    try {
      await axiosInstance.post(`/like/${tweetstate._id}`, { userId: user._id });
    } catch (error) {
      console.error("Like interaction failed:", error);
      settweetstate((prev: any) => ({
        ...prev,
        likes: isLiked ? prev.likes + 1 : prev.likes - 1, 
        likedBy: isLiked
          ? [...prev.likedBy, user._id] 
          : prev.likedBy.filter((id: string) => id !== user._id), 
      }));
    }
  };

  const retweetTweet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const isRetweeted = tweetstate.retweetedBy.includes(user._id);

    settweetstate((prev: any) => ({
      ...prev,
      retweets: isRetweeted ? prev.retweets - 1 : prev.retweets + 1,
      retweetedBy: isRetweeted
        ? prev.retweetedBy.filter((id: string) => id !== user._id)
        : [...prev.retweetedBy, user._id],
    }));

    try {
      await axiosInstance.post(`/retweet/${tweetstate._id}`, { userId: user._id });
    } catch (error) {
      console.error("Retweet interaction failed:", error);
      settweetstate((prev: any) => ({
        ...prev,
        retweets: isRetweeted ? prev.retweets + 1 : prev.retweets - 1,
        retweetedBy: isRetweeted
          ? [...prev.retweetedBy, user._id]
          : prev.retweetedBy.filter((id: string) => id !== user._id),
      }));
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!user) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    setIsDeleted(true);

    try {
      await axiosInstance.delete(`/post/${tweetstate._id}`, {
        data: { userId: user._id }
      });
      console.log("Tweet deleted from database");
    } catch (error) {
      console.error("Failed to delete tweet:", error);
      setIsDeleted(false);
      alert("Something went wrong. Could not delete the post.");
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const isLiked = user ? tweetstate.likedBy.includes(user._id) : false;
  const isRetweet = user ? tweetstate.retweetedBy.includes(user._id) : false;

  if (isDeleted) return null;

  return (
    <article className="px-3 sm:px-4 pt-3 pb-2 border-b border-gray-800 bg-black hover:bg-white/[0.02] transition-colors cursor-pointer w-full">
      <div className="flex space-x-2.5 sm:space-x-3">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            <AvatarImage src={tweetstate.author.avatar} alt={tweetstate.author.displayName} className="object-cover" />
            <AvatarFallback>{tweetstate.author.displayName[0]}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center space-x-1 overflow-hidden text-[14px] sm:text-[15px] min-w-0">
              <span className="font-bold text-white hover:underline truncate">
                {tweetstate.author.displayName}
              </span>

              {tweetstate.author.verified && (
                <div className="text-blue-500 shrink-0 flex items-center justify-center">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 3.998 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.867 3.45-.032.22-.05.443-.05.668 0 2.21 1.71 3.998 3.918 3.998.47 0 .92-.084 1.336-.25.52 1.334 1.818 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.166.866.25 1.336.25 2.21 0 3.918-1.792 3.918-3.998 0-.225-.018-.448-.05-.668 1.127-.704 1.867-1.99 1.867-3.45zm-11.16 4.083l-4.5-4.5 1.41-1.414 3.085 3.085 6.09-6.09 1.414 1.414-7.5 7.5z"></path></g>
                  </svg>
                </div>
              )}

              <span className="text-gray-500 truncate shrink">
                @{tweetstate.author.username}
              </span>

              <span className="text-gray-500 shrink-0 px-0.5">·</span>

              <span className="text-gray-500 hover:underline shrink-0 text-xs sm:text-sm">
                {tweetstate.timestamp &&
                  new Date(tweetstate.timestamp).toLocaleDateString("en-us", {
                    month: "short",
                    day: "numeric",
                  })}
              </span>
            </div>

            {/* Trash icon for author */}
            <div className="flex items-center shrink-0">
              {user && user._id === tweetstate.author._id && (
                <button 
                  onClick={handleDelete}
                  className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-1.5 sm:p-2 rounded-full transition-colors group"
                  title="Delete Post"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 group-hover:text-red-500" />
                </button>
              )}
              <Button variant="ghost" className="text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 p-1.5 sm:p-2 rounded-full transition-colors h-auto -mr-2">
                <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-[14px] sm:text-[15px] text-white mb-2.5 whitespace-pre-wrap break-words leading-normal">
            {tweetstate.content}
          </div>

          {/* Attached Image */}
          {tweetstate.image && (
            <div className="mb-2.5 rounded-2xl overflow-hidden border border-gray-800">
              <img
                src={tweetstate.image}
                alt="Tweet attachment"
                className="w-full h-auto max-h-96 sm:max-h-125 object-cover"
              />
            </div>
          )}

          {/* Attached Audio Player */}
          {tweetstate.audio?.url && (
            <div className="mb-2.5 w-full border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50 p-2">
              <audio 
                controls 
                className="w-full h-9 sm:h-10"
                preload="metadata"
                src={tweetstate.audio.url}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between text-gray-500 w-full sm:max-w-[425px]">
            <button className="flex items-center group transition-colors hover:text-blue-500 outline-none">
              <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <MessageCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <span className="text-[12px] sm:text-[13px] px-1">{formatNumber(tweetstate.comments || 0)}</span>
            </button>

            <button 
              onClick={retweetTweet}
              className={`flex items-center group transition-colors outline-none ${isRetweet ? 'text-green-500' : 'hover:text-green-500'}`}
            >
              <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Repeat2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <span className="text-[12px] sm:text-[13px] px-1">{formatNumber(tweetstate.retweets || 0)}</span>
            </button>

            <button 
              onClick={likeTweet}
              className={`flex items-center group transition-colors outline-none ${isLiked ? 'text-pink-600' : 'hover:text-pink-600'}`}
            >
              <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                <Heart className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[12px] sm:text-[13px] px-1">{formatNumber(tweetstate.likes || 0)}</span>
            </button>

            <Button variant="ghost" className="flex items-center group transition-colors hover:text-blue-500 outline-none p-1.5 sm:p-2 h-auto">
              <Share className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}