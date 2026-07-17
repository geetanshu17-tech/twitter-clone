"use client";

import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import axiosInstance from '@/lib/axiosInstance';

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
    avatar: 'https://images.pexels.com/photos/38076051/pexels-photo-38076051.jpeg',
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
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleLanguageSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    if (!user) return; 
    setPendingLanguage(selectedLang); 
    
    try {
      // 3. Cast user as 'any' to bypass the TypeScript red lines
      const currentUser = user as any; 

      await axiosInstance.post("/send-language-otp", { 
        targetLanguage: selectedLang,
        email: currentUser.email,
        phone: currentUser.phone 
      });
      
      // 4. Open the modal for them to type the code
      setShowOtpModal(true);
    } catch (error) {
      console.error("Failed to trigger OTP");
    }
  };
  const handleVerifyLanguageOtp = async () => {
    setOtpError("");
    try {
      const currentUser = user as any;
      
      // Hit your existing verify route
      await axiosInstance.post("/verify-otp", {
        email: currentUser.email,
        otp: otpInput
      });

      // 🚨 SUCCESS! Change the language and close modal
      i18n.changeLanguage(pendingLanguage);
      setShowOtpModal(false);
      setOtpInput("");
      
    } catch (err: any) {
      setOtpError("Invalid OTP. Please try again.");
    }
  };

  // --- Subscription Logic ---
  const currentUser = user as any; // Using the quick bypass for Vercel
  
  const currentPlan = (currentUser?.subscriptionPlan || "FREE").toUpperCase();
  const isPremium = currentPlan !== "FREE";
  
  const formattedExpiry = currentUser?.planExpiryDate
    ? new Date(currentUser.planExpiryDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";
  // --------------------------

  return (
    <div className="w-full h-full space-y-4 pt-1">
      {/* Sticky Search Bar */}
      <div className="sticky top-0 bg-black py-1 z-10">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder={t('search')}
            className="pl-12 bg-[#202327] border border-transparent focus:border-blue-500 focus:bg-black text-white placeholder-gray-500 rounded-full py-5 h-11 transition-colors outline-none ring-0 focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Conditional Premium Card */}
      {isPremium ? (
        <div className="bg-[#16181c] rounded-2xl p-4 border border-[#16181c] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[#e7e9ea] text-xl font-extrabold">{t('yourPremium')}</h3>
              <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {t('active')}
              </span>
            </div>
            <p className="text-gray-400 text-[14px] mb-4">
              {t('plan')}: <span className="text-blue-500 font-bold">{currentPlan}</span><br/>
              {t('validUntil')}: <span className="text-white">{formattedExpiry}</span>
            </p>
            <Link href="/subscriptions">
              <Button className="bg-white hover:bg-gray-200 text-black font-bold rounded-full px-5 py-2 h-auto text-[15px] w-full transition-colors">
                {t('managePlan')}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-[#16181c] rounded-2xl p-4 border border-[#16181c]">
          <h3 className="text-[#e7e9ea] text-xl font-extrabold mb-2">{t('subscribePremium')}</h3>
          <p className="text-white text-[15px] mb-3 leading-snug font-medium">
            {t('subscribeDesc')}
          </p>
          <Link href="/subscriptions">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-5 py-2 h-auto text-[15px] w-full">
              {t('subscribe')}
            </Button>
          </Link>
        </div>
      )}

      {/* Who to follow */}
      <div className="bg-[#16181c] rounded-2xl pt-4 border border-[#16181c]">
        <h3 className="text-[#e7e9ea] text-xl font-extrabold mb-4 px-4">{t('whoToFollow')}</h3>
        <div className="flex flex-col">
          {suggestions.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors w-full text-left cursor-pointer">
              <div className="flex items-center space-x-3 overflow-hidden">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={user.avatar} alt={user.displayName} className="object-cover" />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                  <div className="flex items-center space-x-1 truncate">
                    <span className="text-white font-bold text-[15px] hover:underline truncate">{user.displayName}</span>
                    {user.verified && (
                      <div className="text-blue-500 shrink-0 flex items-center justify-center">
                         <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
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
                {t('follow')}
              </Button>
            </div>
          ))}
        </div>
        <button className="w-full text-left px-4 py-4 text-blue-500 hover:bg-white/[0.03] rounded-b-2xl transition-colors text-[15px]">
          {t('Show more')}
        </button>
      </div>

      {/* --- Language Selector --- */}
      <div className="bg-[#16181c] rounded-2xl p-4 border border-[#16181c]">
        <h3 className="text-[#e7e9ea] text-xl font-extrabold mb-3">{t('language') || 'Language'}</h3>
        <select 
          value={i18n.resolvedLanguage} 
          onChange={handleLanguageSelect} // <-- Updated this line!
          className="w-full bg-black text-white p-3 rounded-xl border border-zinc-700 outline-none focus:border-sky-500 appearance-none cursor-pointer"
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

      {/* Footer */}
      <div className="px-4 text-[13px] text-gray-500 space-y-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <a href="#" className="hover:underline">{t('termsOfService')}</a>
          <a href="#" className="hover:underline">{t('privacyPolicy')}</a>
          <a href="#" className="hover:underline">{t('cookiePolicy')}</a>
          <a href="#" className="hover:underline">{t('accessibility')}</a>
          <a href="#" className="hover:underline">{t('adsInfo')}</a>
          <a href="#" className="hover:underline">{t('more')}</a>
        </div>
        <div>© 2026 X Corp.</div>
      </div>

      {/* ================= OTP MODAL ================= */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
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