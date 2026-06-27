"use client";

import { Search } from 'lucide-react';
import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const suggestions = [
  {
    id: '1',
    username: 'leonelmessi',
    displayName: 'Lionel Messi',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true
  },
  {
    id: '2',
    username: 'chrisbrown',
    displayName: 'Chris Brown',
    avatar: 'https://images.pexels.com/photos/1382735/pexels-photo-1382735.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true
  },
  {
    id: '3',
    username: 'rashtrapatibhvn',
    displayName: 'President of India',
    avatar: 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true
  }
];

export default function RightSidebar() {
  return (
    <div className="w-full h-full space-y-4 pt-1">
      {/* Sticky Search Bar */}
      <div className="sticky top-0 bg-black py-1 z-10">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Search"
            className="pl-12 bg-[#202327] border border-transparent focus:border-blue-500 focus:bg-black text-white placeholder-gray-500 rounded-full py-5 h-11 transition-colors outline-none ring-0 focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Subscribe to Premium */}
      <div className="bg-[#16181c] rounded-2xl p-4 border border-[#16181c]">
        <h3 className="text-[#e7e9ea] text-xl font-extrabold mb-2">Subscribe to Premium</h3>
        <p className="text-white text-[15px] mb-3 leading-snug font-medium">
          Subscribe to unlock new features and if eligible, receive a share of revenue.
        </p>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-5 py-2 h-auto text-[15px]">
          Subscribe
        </Button>
      </div>

      {/* Who to follow */}
      <div className="bg-[#16181c] rounded-2xl pt-4 border border-[#16181c]">
        <h3 className="text-[#e7e9ea] text-xl font-extrabold mb-4 px-4">Who to follow</h3>
        <div className="flex flex-col">
          {suggestions.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors w-full text-left cursor-pointer">
              <div className="flex items-center space-x-3 overflow-hidden">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={user.avatar} alt={user.displayName} className="object-cover" />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                  <div className="flex items-center space-x-1 truncate">
                    <span className="text-white font-bold text-[15px] hover:underline truncate">{user.displayName}</span>
                    {user.verified && (
                      <div className="text-blue-500 flex-shrink-0 flex items-center justify-center">
                         <svg className="h-[18px] w-[18px] fill-current" viewBox="0 0 24 24">
                          <g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 3.998 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.867 3.45-.032.22-.05.443-.05.668 0 2.21 1.71 3.998 3.918 3.998.47 0 .92-.084 1.336-.25.52 1.334 1.818 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.166.866.25 1.336.25 2.21 0 3.918-1.792 3.918-3.998 0-.225-.018-.448-.05-.668 1.127-.704 1.867-1.99 1.867-3.45zm-11.16 4.083l-4.5-4.5 1.41-1.414 3.085 3.085 6.09-6.09 1.414 1.414-7.5 7.5z"></path></g>
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-500 text-[15px] truncate">@{user.username}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="bg-[#eff3f4] text-[#0f1419] hover:bg-[#d7dbdc] font-bold rounded-full px-4 h-8 ml-2 border-none transition-colors"
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
        <button className="w-full text-left px-4 py-4 text-blue-500 hover:bg-white/[0.03] rounded-b-2xl transition-colors text-[15px]">
          Show more
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 text-[13px] text-gray-500 space-y-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Cookie Policy</a>
          <a href="#" className="hover:underline">Accessibility</a>
          <a href="#" className="hover:underline">Ads info</a>
          <a href="#" className="hover:underline">More ...</a>
        </div>
        <div>© 2026 X Corp.</div>
      </div>
    </div>
  );
}