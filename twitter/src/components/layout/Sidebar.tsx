"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal, Settings, LogOut
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import TwitterLogo from '../Twitterlogo';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function Sidebar({ currentPage = 'home', onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);
  const prevCountRef = useRef(0);
  const isFirstLoad = useRef(true); // NEW: Better way to track the first page load

  useEffect(() => {
    const fetchBadgeCount = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`http://localhost:5000/notifications/${user.email}`);
        const fetchedNotifications = res.data;
        const currentCount = fetchedNotifications.length;

        // If we have MORE notifications than the last time we checked...
        if (currentCount > prevCountRef.current) {
          
          // Only fire the popup if it's NOT the initial page load
          if (!isFirstLoad.current && user.notificationEnabled && Notification.permission === "granted") {
            const latestNotif = fetchedNotifications[0]; 
            new Notification("New Alert!", {
              body: latestNotif.message
            });
          }
        }

        setUnreadCount(currentCount);
        prevCountRef.current = currentCount;
        isFirstLoad.current = false; // Mark initial load as complete

      } catch (error) {
        console.error("Failed to fetch badge count", error);
      }
    };

    fetchBadgeCount();
    const interval = setInterval(fetchBadgeCount, 10000); 
    return () => clearInterval(interval);
  }, [user]);

  const navigation = [
    { name: 'Home', icon: Home, current: currentPage === 'home', page: 'home' },
    { name: 'Explore', icon: Search, current: currentPage === 'explore', page: 'explore' },
    { name: 'Notifications', icon: Bell, current: currentPage === 'notifications', page: 'notifications', badgeCount: unreadCount },
    { name: 'Messages', icon: Mail, current: currentPage === 'messages', page: 'messages' },
    { name: 'Bookmarks', icon: Bookmark, current: currentPage === 'bookmarks', page: 'bookmarks' },
    { name: 'Profile', icon: User, current: currentPage === 'profile', page: 'profile' },
    { name: 'More', icon: MoreHorizontal, current: currentPage === 'more', page: 'more' },
  ];

  return (
    <div className="fixed flex flex-col h-screen w-20 md:w-[250px] bg-black overflow-y-auto no-scrollbar">
      <div className="p-3 pb-0 flex items-center md:items-start justify-center md:justify-start">
        <div className="p-3 hover:bg-white/10 rounded-full cursor-pointer transition-colors w-fit">
          <TwitterLogo size="md" className="text-white" />
        </div>
      </div>
      
      <nav className="flex-1 px-2 mt-2">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name} className="flex justify-center md:justify-start">
              <button
                className="group flex items-center outline-none"
                onClick={() => onNavigate?.(item.page)}
              >
                <div className="flex items-center p-3 rounded-full group-hover:bg-white/10 transition-colors duration-200">
                  <item.icon className={`h-7 w-7 ${item.current ? 'text-white fill-white' : 'text-white'}`} />
                  <span className={`hidden md:block ml-5 text-xl pr-4 ${item.current ? 'font-bold' : 'font-normal'}`}>
                    {item.name}
                  </span>
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span className="hidden md:flex ml-2 bg-blue-500 text-white text-[11px] font-bold rounded-full h-5 w-5 items-center justify-center">
                      {item.badgeCount}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 px-2 w-full flex justify-center md:justify-start">
          <Button className="hidden md:flex w-[90%] items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold h-14 rounded-full text-lg transition-colors shadow-sm">
            Post
          </Button>
          {/* Mobile Post Button */}
          <Button className="md:hidden bg-blue-500 hover:bg-blue-600 text-white rounded-full h-12 w-12 p-0 flex items-center justify-center mt-2 shadow-sm">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current"><g><path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.22-2.012.671-3.015l4.197-4.197c-1.082-1.082-1.082-2.836 0-3.918 1.082-1.082 2.836-1.082 3.918 0l4.197-4.197c1.003-.451 2.008-.671 3.015-.671v-2z"></path></g></svg>
          </Button>
        </div>
      </nav>
      
      {user && (
        <div className="p-3 mb-2 flex justify-center md:justify-start w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between p-3 rounded-full hover:bg-white/10 transition-colors w-full outline-none">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.displayName} className="object-cover" />
                    <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col text-left ml-3 mr-4">
                    <span className="text-white font-bold text-[15px] leading-tight">{user.displayName}</span>
                    <span className="text-gray-500 text-[15px] leading-tight">@{user.username}</span>
                  </div>
                </div>
                <MoreHorizontal className="hidden md:block h-5 w-5 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[260px] bg-black border border-gray-800 shadow-[0_0_15px_rgba(255,255,255,0.2)] rounded-2xl mb-2">
              <DropdownMenuItem className="text-white font-bold text-[15px] p-3 hover:bg-white/5 cursor-pointer">
                Add an existing account
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-white font-bold text-[15px] p-3 hover:bg-white/5 cursor-pointer"
                onClick={logout}
              >
                Log out @{user.username}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}