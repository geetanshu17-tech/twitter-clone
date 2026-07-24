"use client";

import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Image, Smile, Calendar, MapPin, BarChart3, Globe, X, Mic } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { useTranslation } from 'react-i18next';

const TweetComposer = ({ onTweetPosted }: any) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // -- State --
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageurl, setimageurl] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  
  // -- Audio State --
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const maxLength = 200;

  // ==========================================
  // AUDIO VALIDATION LOGIC
  // ==========================================
  const checkTimeRestriction = (): boolean => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false 
    });
    const currentHourIST = parseInt(formatter.format(new Date()));
    
    // Allowed window is 14:00 (2 PM) to 18:59 (6:59 PM)
    if (currentHourIST < 11 || currentHourIST >= 19) {
      setAudioError("Audio tweets are only allowed between 2:00 PM and 7:00 PM IST.");
      return false;
    }
    return true;
  };

  const handleAudioSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!checkTimeRestriction()) {
      if (audioInputRef.current) audioInputRef.current.value = "";
      return;
    }

    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setAudioError("Audio file exceeds the maximum size of 100 MB.");
      if (audioInputRef.current) audioInputRef.current.value = "";
      return;
    }

    const tempUrl = URL.createObjectURL(file);
    const audioElement = document.createElement('audio');
    audioElement.src = tempUrl;
    audioElement.preload = 'metadata';

    audioElement.onloadedmetadata = () => {
      if (audioElement.duration === Infinity || audioElement.duration > 300) { 
        setAudioError("Audio duration cannot exceed 5 minutes.");
        URL.revokeObjectURL(tempUrl);
        if (audioInputRef.current) audioInputRef.current.value = "";
      } else {
        setAudioFile(file);
        setAudioPreviewUrl(tempUrl);
      }
    };
    
    audioElement.onerror = () => {
      setAudioFile(file);
      setAudioPreviewUrl(tempUrl);
    };
  };

  const removeAudio = () => {
    setAudioFile(null);
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(null);
    setAudioError(null);
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user || (!content.trim() && !imageurl && !audioFile)) return; 
    
    if (audioFile) {
      setIsLoading(true);
      try {
        await axiosInstance.post("/generate-audio-otp", { email: user.email });
        setShowOtpModal(true);
      } catch (error) {
        alert("Failed to generate OTP for audio upload. Please try again later.");
      } finally {
        setIsLoading(false);
      }
      return; 
    }
    await executePost();
  };

  const handleVerifyOtp = async () => {
    if (!user || !user.email) return;
    try {
      // .trim() removes any sneaky mobile keyboard spaces
      await axiosInstance.post("/verify-otp", {
        email: user.email,
        otp: otpInput.trim()
      });

      setShowOtpModal(false);
      await executePost(); 
    } catch (error: any) {
      alert(error.response?.data?.error || "Invalid OTP. Please try again.");
    }
  };

  const executePost = async () => {
    if (!user || !user.email) return;
    setIsLoading(true);
    try {
      let finalAudioUrl = null;
      let finalAudioDuration = null;
      let finalAudioSize = null;

      if (audioFile) {
        const audioFormData = new FormData();
        
        // Ensure a fallback filename exists so mobile browsers don't send an empty stream
        const fileName = (audioFile.name && audioFile.name.trim() !== "") 
          ? audioFile.name 
          : "mobile_voice_note.mp3";

        audioFormData.append("audio", audioFile, fileName);

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://twitter-clone-24tp.onrender.com";

        // Using native fetch guarantees proper multipart boundary construction on mobile browsers
        const uploadResponse = await fetch(`${backendUrl}/upload/audio`, {
          method: "POST",
          body: audioFormData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "Failed to upload audio file");
        }
        
        finalAudioUrl = uploadData.url; 
        finalAudioSize = audioFile.size;
        
        const tempAudio = document.createElement('audio');
        tempAudio.src = URL.createObjectURL(audioFile);
        await new Promise((resolve) => {
          tempAudio.onloadedmetadata = () => {
            finalAudioDuration = tempAudio.duration;
            resolve(true);
          };
          tempAudio.onerror = () => resolve(true);
        });
      }

      const tweetdata = { 
        author: user._id, 
        content: content, 
        image: imageurl,
        audioUrl: finalAudioUrl,          
        audioDuration: finalAudioDuration, 
        audioSize: finalAudioSize
      };

      const res = await axiosInstance.post("/post", tweetdata);
      
      onTweetPosted(res.data);
      setContent("");
      setimageurl("");
      removeAudio(); 
      setShowOtpModal(false);

    } catch (error: any) {
      console.error("Backend Error:", error.response?.data || error.message);
      // Alerts the EXACT server message (e.g., "Tweet limit reached" or "Time restricted")
      const serverMessage = error.response?.data?.error || error.response?.data?.message || "Failed to post tweet";
      alert(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;
  
  if (!user) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsLoading(true);
    const image = e.target.files[0];
    const formdataimg = new FormData();
    formdataimg.set("image", image);
    try {
      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        formdataimg
      );
      const url = res.data.data.display_url;
      if (url) {
        setimageurl(url);
      }
    } catch (error) {
      console.log("Image Upload Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-black border-gray-800 border-x-0 border-t-0 rounded-none">
      <CardContent className="p-3 sm:p-4">
        <div className="flex space-x-3 sm:space-x-4">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
            <AvatarImage src={user.avatar} alt={user.displayName} className="object-cover" />
            <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder={t('whatsHappening')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-transparent border-none text-[16px] sm:text-xl text-white placeholder-gray-500 resize-none min-h-[90px] sm:min-h-30 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />

              {/* Image Preview */}
              {imageurl && (
                <div className="relative mt-2 inline-block max-w-full">
                  <img 
                    src={imageurl} 
                    alt="Upload preview" 
                    className="max-h-60 sm:max-h-72 rounded-2xl object-cover border border-gray-800 w-full"
                  />
                  <Button
                    type="button"
                    onClick={() => setimageurl("")}
                    className="absolute top-2 left-2 bg-black/75 hover:bg-black/90 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Audio Preview */}
              {audioPreviewUrl && (
                <div className="relative mt-3 p-3 border border-gray-800 rounded-2xl bg-gray-900/50 flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={removeAudio}
                    className="absolute -top-2 -left-2 bg-black hover:bg-gray-800 text-white p-1.5 rounded-full border border-gray-700 transition-colors z-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <span className="text-xs sm:text-sm font-semibold text-blue-400 ml-2">Voice Note Attached</span>
                  <audio controls src={audioPreviewUrl} className="w-full h-10 outline-none rounded-full" />
                </div>
              )}

              {audioError && (
                <div className="mt-2 text-xs sm:text-sm font-bold text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  {audioError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 pt-2 border-t border-gray-800/80 gap-3">
                <div className="flex items-center justify-between sm:justify-start space-x-1 sm:space-x-2 text-blue-400">
                  
                  {/* Image Upload Button */}
                  <label
                    htmlFor="tweetImage"
                    className={`p-2 rounded-full cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-900/20'}`}
                  >
                    <Image className="h-5 w-5" />
                    <Input
                      type="file"
                      accept="image/*"
                      id="tweetImage"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={isLoading}
                    />
                  </label>

                  {/* Audio Upload Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => audioInputRef.current?.click()}
                    className={`p-2 rounded-full cursor-pointer text-blue-400 hover:bg-blue-900/20 h-auto ${audioFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!!audioFile}
                  >
                    <Mic className="h-5 w-5" />
                    <Input 
                      type="file" 
                      accept="audio/*" 
                      ref={audioInputRef}
                      className="hidden" 
                      onChange={handleAudioSelection}
                    />
                  </Button>

                  <Button variant="ghost" size="sm" className="p-2 rounded-full text-blue-400 hover:bg-blue-900/20 h-auto">
                    <Smile className="h-5 w-5" />
                  </Button>

                  {/* Desktop-only secondary icons */}
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex p-2 rounded-full text-blue-400 hover:bg-blue-900/20 h-auto">
                    <BarChart3 className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex p-2 rounded-full text-blue-400 hover:bg-blue-900/20 h-auto">
                    <Calendar className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex p-2 rounded-full text-blue-400 hover:bg-blue-900/20 h-auto">
                    <MapPin className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end space-x-3">
                  <div className="flex items-center space-x-1.5 text-blue-400 text-xs sm:text-sm font-semibold">
                    <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{t("everyonecanreply")}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Separator orientation="vertical" className="hidden sm:block h-6 bg-gray-700" />
                    <Button
                      type="submit"
                      disabled={(!content.trim() && !imageurl && !audioFile) || isOverLimit || isLoading}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-full px-5 py-1.5 text-sm h-9"
                    >
                      {isLoading ? "Loading..." : "Post"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </CardContent>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 p-5 sm:p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => {
                setShowOtpModal(false);
                setIsLoading(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Verify Your Identity</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-5">
              To post an audio tweet, please enter the 6-digit code sent to your email.
            </p>

            <Input
              type="text"
              placeholder="Enter OTP"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="bg-black border-gray-700 text-white mb-4 text-center text-lg tracking-widest h-12"
              maxLength={6}
            />

            <Button
              onClick={handleVerifyOtp}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-11 sm:h-12 rounded-full"
            >
              Verify & Post
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TweetComposer;