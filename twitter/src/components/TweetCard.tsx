"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
} from "lucide-react";

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
  const user = {
    _id: "demo-user",
    username: "demo",
  };

  const initialTweetData = tweet ? { ...defaultMockTweet, ...tweet } : defaultMockTweet;

  const [tweetstate, settweetstate] = useState({
    ...initialTweetData,
    likedBy: initialTweetData.likedBy || [],
    retweetedBy: initialTweetData.retweetedBy || [],
  });

  const likeTweet = (e: React.MouseEvent) => {
    e.stopPropagation();
    settweetstate((prev: any) => {
      const isLiked = prev.likedBy.includes(user._id);
      return {
        ...prev,
        likes: isLiked ? prev.likes - 1 : prev.likes + 1,
        likedBy: isLiked
          ? prev.likedBy.filter((id: string) => id !== user._id)
          : [...prev.likedBy, user._id],
      };
    });
  };

  const retweetTweet = (e: React.MouseEvent) => {
    e.stopPropagation();
    settweetstate((prev: any) => {
      const isRetweeted = prev.retweetedBy.includes(user._id);
      return {
        ...prev,
        retweets: isRetweeted ? prev.retweets - 1 : prev.retweets + 1,
        retweetedBy: isRetweeted
          ? prev.retweetedBy.filter((id: string) => id !== user._id)
          : [...prev.retweetedBy, user._id],
      };
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const isLiked = tweetstate.likedBy.includes(user._id);
  const isRetweet = tweetstate.retweetedBy.includes(user._id);

  return (
    <article className="px-4 pt-3 pb-2 border-b border-gray-800 bg-black hover:bg-white/[0.02] transition-colors cursor-pointer w-full">
      <div className="flex space-x-3">
        {/* Avatar Section */}
        <div className="flex-shrink-0 pt-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={tweetstate.author.avatar} alt={tweetstate.author.displayName} className="object-cover" />
            <AvatarFallback>{tweetstate.author.displayName[0]}</AvatarFallback>
          </Avatar>
        </div>

        
        <div className="flex-1 min-w-0">
          
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center space-x-1 overflow-hidden text-[15px]">
              <span className="font-bold text-white hover:underline truncate">
                {tweetstate.author.displayName}
              </span>

              {tweetstate.author.verified && (
                <div className="text-blue-500 flex-shrink-0 flex items-center justify-center">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 3.998 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.867 3.45-.032.22-.05.443-.05.668 0 2.21 1.71 3.998 3.918 3.998.47 0 .92-.084 1.336-.25.52 1.334 1.818 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.166.866.25 1.336.25 2.21 0 3.918-1.792 3.918-3.998 0-.225-.018-.448-.05-.668 1.127-.704 1.867-1.99 1.867-3.45zm-11.16 4.083l-4.5-4.5 1.41-1.414 3.085 3.085 6.09-6.09 1.414 1.414-7.5 7.5z"></path></g>
                  </svg>
                </div>
              )}

              <span className="text-gray-500 truncate flex-shrink-0">
                @{tweetstate.author.username}
              </span>

              <span className="text-gray-500 flex-shrink-0 px-1">·</span>

              <span className="text-gray-500 hover:underline flex-shrink-0">
                {tweetstate.timestamp &&
                  new Date(tweetstate.timestamp).toLocaleDateString("en-us", {
                    month: "short",
                    day: "numeric",
                  })}
              </span>
            </div>

            <button className="text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 p-2 rounded-full transition-colors group -mr-2">
              <MoreHorizontal className="h-5 w-5 group-hover:text-blue-500" />
            </button>
          </div>

          {/* Text Content */}
          <div className="text-[15px] text-white mb-3 whitespace-pre-wrap break-words leading-snug">
            {tweetstate.content}
          </div>

          {/* Attached Image */}
          {tweetstate.image && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-gray-800">
              <img
                src={tweetstate.image}
                alt="Tweet attachment"
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          
          <div className="flex items-center justify-between text-gray-500 max-w-[425px]">
            {/* Comment */}
            <button className="flex items-center group transition-colors hover:text-blue-500 outline-none">
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <MessageCircle className="h-[18px] w-[18px]" />
              </div>
              <span className="text-[13px] px-1">{formatNumber(tweetstate.comments || 0)}</span>
            </button>

            {/* Retweet */}
            <button 
              onClick={retweetTweet}
              className={`flex items-center group transition-colors outline-none ${isRetweet ? 'text-green-500' : 'hover:text-green-500'}`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Repeat2 className="h-[18px] w-[18px]" />
              </div>
              <span className="text-[13px] px-1">{formatNumber(tweetstate.retweets || 0)}</span>
            </button>

            {/* Like */}
            <button 
              onClick={likeTweet}
              className={`flex items-center group transition-colors outline-none ${isLiked ? 'text-pink-600' : 'hover:text-pink-600'}`}
            >
              <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                <Heart className={`h-[18px] w-[18px] ${isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[13px] px-1">{formatNumber(tweetstate.likes || 0)}</span>
            </button>

            {/* Share */}
            <button className="flex items-center group transition-colors hover:text-blue-500 outline-none">
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <Share className="h-[18px] w-[18px]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}