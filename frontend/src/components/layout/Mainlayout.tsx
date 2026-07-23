"use client";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import LoadingSpinner from "../loading-spinner";
import Sidebar from "./Sidebar";
import RightSidebar from "./Rightsidebar";
import ProfilePage from "../ProfilePage";
import NotificationsPage from "../NotificationsPage"; 
import TwitterLogo from "../Twitterlogo";
import { Home, Search, Bell, User } from "lucide-react";

const Mainlayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <TwitterLogo className="text-white h-12 w-12 mx-auto mb-4 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="w-full min-h-screen bg-black text-white flex justify-center">
      
      {/* Left Sidebar (Hidden on mobile < 640px, visible on sm and above) */}
      <div className="hidden sm:flex w-20 md:w-64 border-r border-gray-800 justify-end">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>

      {/* Main Content Area (Full width on mobile, constrained on desktop) */}
      <main className="flex-1 w-full max-w-2xl border-r border-gray-800 min-h-screen pb-16 sm:pb-0">
        {currentPage === "notifications" ? (
          <NotificationsPage />
        ) : currentPage === "profile" ? (
          <ProfilePage />
        ) : (
          children
        )}
      </main>

      {/* Right Sidebar (Desktop only) */}
      <div className="hidden lg:block w-80 p-4">
        <RightSidebar />
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on < 640px) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-gray-800 flex justify-around items-center h-14 px-2">
        <button 
          onClick={() => setCurrentPage("home")} 
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <Home className={`h-6 w-6 ${currentPage === 'home' ? 'fill-white text-white' : 'text-gray-400'}`} />
        </button>
        <button 
          onClick={() => setCurrentPage("explore")} 
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <Search className={`h-6 w-6 ${currentPage === 'explore' ? 'fill-white text-white' : 'text-gray-400'}`} />
        </button>
        <button 
          onClick={() => setCurrentPage("notifications")} 
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <Bell className={`h-6 w-6 ${currentPage === 'notifications' ? 'fill-white text-white' : 'text-gray-400'}`} />
        </button>
        <button 
          onClick={() => setCurrentPage("profile")} 
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <User className={`h-6 w-6 ${currentPage === 'profile' ? 'fill-white text-white' : 'text-gray-400'}`} />
        </button>
      </nav>
      
    </div>
  );
};

export default Mainlayout;