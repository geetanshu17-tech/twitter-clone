"use client";
import React, { useState, useEffect } from "react";
import { Settings, ArrowLeft, Bell } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { useTranslation } from "react-i18next";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // -- UI State --
  const [activeTab, setActiveTab] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  
  // -- Settings State --
  const [notificationEnabled, setNotificationEnabled] = useState(user?.notificationEnabled || false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // -- Feed State --
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // 1. FETCH NOTIFICATIONS (LOADS ON MOUNT)
  // ==========================================
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`https://twitter-clone-24tp.onrender.com/notifications/${user.email}`);
        setNotifications(res.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch if we are looking at the feed, not the settings
    if (!showSettings) {
      fetchNotifications();
    }
  }, [user, showSettings]);

  // ==========================================
  // 2. HANDLE BROWSER TOGGLE SETTINGS
  // ==========================================
  const handleToggle = async () => {
    if (!user) return;

    const newState = !notificationEnabled;

    if (newState === true) {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        alert("You have blocked notifications in your browser. Please allow them in your URL bar.");
        return; 
      }
    }

    setIsUpdating(true);
    setNotificationEnabled(newState);

    try {
      await axios.patch(`https://twitter-clone-24tp.onrender.com/userupdate/${user.email}`, {
        notificationEnabled: newState
      });
      console.log("Settings successfully saved to MongoDB!");
    } catch (error) {
      console.error("Failed to update database", error);
      setNotificationEnabled(!newState); 
    } finally {
      setIsUpdating(false);
    }
  };


  const handleClearNotifications = async () => {
    
    if (!user) return; 

    try {
      await axiosInstance.delete("/notifications/clear", {
        data: { userId: user._id } // The red line will vanish now!
      });
      setNotifications([]); 
      alert("Notification history cleared successfully."); 
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  };

  // ==========================================
  // RENDER: SETTINGS VIEW
  // ==========================================
  if (showSettings) {
    return (
      <div className="w-full flex flex-col">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex items-center gap-6">
          <button 
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{t("notificationsettings")}</h1>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between p-4 border border-gray-800 rounded-2xl hover:bg-white/5 transition-colors">
            <div>
              <h2 className="text-[15px] font-bold">{t("Keyword Push Notifications")}</h2>
              <p className="text-[13px] text-gray-500 mt-1">
                {t("Keyword Push Notifications Desc")}
              </p>
            </div>
            <button
              onClick={handleToggle}
              disabled={isUpdating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ease-in-out duration-300 focus:outline-none ${
                notificationEnabled ? "bg-blue-500" : "bg-gray-600"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-300 ease-in-out ${
                  notificationEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN FEED VIEW
  // ==========================================
  return (
    <div className="w-full flex flex-col min-h-screen">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between p-4 pb-0">
          <h1 className="text-xl font-bold">{t("notifications")}</h1>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex w-full mt-2">
          <button
            onClick={() => setActiveTab("all")}
            className="flex-1 hover:bg-white/10 transition-colors relative"
          >
            <div className={`py-4 font-bold text-[15px] inline-block ${activeTab === "all" ? "text-white" : "text-gray-500"}`}>
              {t("all")}
              {activeTab === "all" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-12 bg-blue-500 rounded-full" />
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab("mentions")}
            className="flex-1 hover:bg-white/10 transition-colors relative"
          >
            <div className={`py-4 font-bold text-[15px] inline-block ${activeTab === "mentions" ? "text-white" : "text-gray-500"}`}>
              {t("mentions")}
              {activeTab === "mentions" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-[70px] bg-blue-500 rounded-full" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Feed Content Area */}
      <div className="flex-1 flex flex-col w-full">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 font-bold">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            {/* UPDATED EMPTY STATE */}
            <h2 className="text-[24px] font-extrabold mb-2">No notifications available.</h2>
            <p className="text-[15px] text-gray-500">
              When someone mentions you or interactions happen, you'll find it here.
            </p>
          </div>

        ) : (
          <>
            {/* NEW CLEAR ALL BUTTON */}
            <div className="p-3 border-b border-gray-800 flex justify-end items-center bg-black/50">
              <button 
                onClick={handleClearNotifications}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold rounded-full transition-colors"
              >
                {t("clearallnofications")}
              </button>
            </div>

            {/* EXISTING NOTIFICATION MAPPING */}
            {notifications.map((notif) => (
              <article key={notif._id} className="p-4 border-b border-gray-800 hover:bg-white/[0.02] transition-colors flex gap-4 cursor-pointer">
                <div className="pt-1">
                  <Bell className="w-7 h-7 text-blue-500 fill-blue-500/20" />
                </div>
                <div className="flex-1">
                  <div className="text-[15px] text-white">
                    {notif.message}
                  </div>
                  <div className="text-[13px] text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric", 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </div>
                </div>
              </article>
            ))}
          </>
        )}
      </div>
    </div>
  )
}