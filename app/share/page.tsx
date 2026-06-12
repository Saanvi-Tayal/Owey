"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Share2, Shuffle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// 1. The Image Vault
// Just list the file names of the 30-40 images you dropped into public/memes/
const IMAGE_POOL = Array.from({ length: 52 }, (_, i) => `/memes/Slice ${i + 1}.png`);

function ShareEngineContent() {
  const searchParams = useSearchParams();
  const [exporting, setExporting] = useState(false);
  
  // Extract dynamic data from the URL just for the WhatsApp message text
  const friendName = searchParams.get("name") || "Rohan";
  const owedAmount = Number(searchParams.get("amount")) || 1450;

  // 2. Smart "No-Repeat" Queue System
  const [playlist, setPlaylist] = useState<number[]>([]);

  // Shuffle the images into a deck on first load
  useEffect(() => {
    const initialPlaylist = IMAGE_POOL.map((_, i) => i);
    // Fisher-Yates Shuffle
    for (let i = initialPlaylist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialPlaylist[i], initialPlaylist[j]] = [initialPlaylist[j], initialPlaylist[i]];
    }
    setPlaylist(initialPlaylist);
  }, []);

  // When clicking Next, move the current image to the back of the line
  const handleNext = () => {
    if (playlist.length <= 1) return;
    setPlaylist((prev) => {
      const newPlaylist = [...prev];
      const current = newPlaylist.shift(); // Remove the front image
      if (current !== undefined) {
        newPlaylist.push(current); // Put it at the very end of the line
      }
      return newPlaylist;
    });
  };

  // 3. FAST NATIVE SHARE LOGIC (No html-to-image required!)
  const handleNativeShare = async () => {
    if (playlist.length === 0) return;
    setExporting(true);
    
    try {
      const currentImagePath = IMAGE_POOL[playlist[0]];
      
      // Fetch the raw image file directly from your public folder
      const res = await fetch(currentImagePath);
      const blob = await res.blob();
      
      // Package it as a real File object for the device
      const imageFile = new File([blob], `owey_meme_${friendName}.jpg`, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
          files: [imageFile],
          title: "Owey Debt Alert 🚨",
          text: `Bruh, ${friendName} owes me ₹${owedAmount}... 💀`,
        });
      } else {
        // Fallback for Desktop browsers: trigger a direct download
        alert("Native share sheet not supported on this device. Downloading the image for you instead! 📥");
        const link = document.createElement("a");
        link.href = currentImagePath;
        link.download = `owey_meme_${friendName}.jpg`;
        link.click();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch or share the image.");
    } finally {
      setExporting(false);
    }
  };

  // Get the currently active image path from the front of the playlist
  const activeImagePath = playlist.length > 0 ? IMAGE_POOL[playlist[0]] : null;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans pb-12">
      <div className="max-w-md mx-auto p-4 space-y-6">
        
        <header className="flex items-center justify-between pt-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-neutral-200">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400 bg-white px-4 py-1.5 rounded-full shadow-sm border border-neutral-200">
            Meme Vault 🧪
          </span>
          <div className="w-10"></div>
        </header>

        {/* 4. Flexible Canvas Container */}
        <div className="w-full flex justify-center py-4">
          <div className="relative select-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black rounded-3xl overflow-hidden bg-white max-w-full">
            {activeImagePath ? (
              // Just a standard IMG tag! It automatically scales to fit perfectly.
              <img 
                src={activeImagePath} 
                alt="Viral Debt Meme" 
                className="block w-full max-h-[70vh] object-contain pointer-events-none"
              />
            ) : (
              <div className="p-12 text-center font-black animate-pulse">Loading Vault...</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleNext}
            className="w-full bg-white text-black hover:bg-neutral-50 border-2 border-black font-black text-sm uppercase tracking-wide rounded-xl py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Shuffle className="h-5 w-5" /> Roll Next
          </Button>
          <Button 
            disabled={exporting}
            onClick={handleNativeShare}
            className="w-full bg-[#bcff4f] hover:bg-[#a6e63b] text-black font-black text-sm uppercase tracking-wide border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />} 
            {exporting ? "Prepping..." : "Share Meme"}
          </Button>
        </div>

      </div>
    </div>
  );
}

export default function ShareMemeEngine() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-neutral-400"><Loader2 className="animate-spin h-6 w-6" /></div>}>
      <ShareEngineContent />
    </Suspense>
  );
}