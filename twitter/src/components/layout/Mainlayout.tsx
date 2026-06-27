"use client";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import LoadingSpinner from "../loading-spinner";
import Sidebar from "./Sidebar";
import RightSidebar from "./Rightsidebar";
import ProfilePage from "../ProfilePage";
import TwitterLogo from "../Twitterlogo"; // Ensure you import this if it's used in loading!

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
    // FIX: Added w-full so the black background stretches infinitely left and right
    <div className="w-full min-h-screen bg-black text-white flex justify-center">
      
      {/* Left Sidebar Layout */}
      <div className="w-20 sm:w-24 md:w-64 border-r border-gray-800 flex justify-end">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>

      {/* Main Feed Layout (Restored your max-w-2xl width) */}
      <main className="flex-1 w-full max-w-2xl border-r border-gray-800 min-h-screen">
        {currentPage === "profile" ? <ProfilePage /> : children}
      </main>

      {/* Right Sidebar Layout */}
      <div className="hidden lg:block w-80 p-4">
        <RightSidebar />
      </div>
      
    </div>
  );
};

export default Mainlayout;