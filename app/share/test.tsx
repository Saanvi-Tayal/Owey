"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Share2, Shuffle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";

const DATA = {
  name: "Rohan",
  amount: 1450,
  days: 37,
};

const TEMPLATES = [
  "spotify",
  "duolingo",
  "netflix",
  "tinder",
  "fbi",
  "pokemon",
  "linkedin",
  "boss",
];

export default function ShareMemeEngine() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const activeTemplate = TEMPLATES[activeIdx];

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % TEMPLATES.length);
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200)); // Layout settle
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        quality: 1.0,
        pixelRatio: 3, // Ultra HD for Instagram
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `owey_meme_${activeTemplate}.png`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to generate image.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans pb-12">
      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Navigation */}
        <header className="flex items-center justify-between pt-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-neutral-200">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400 bg-white px-4 py-1.5 rounded-full shadow-sm border border-neutral-200">
            Meme Lab 🧪
          </span>
          <div className="w-10"></div>
        </header>

        {/* 9:16 INSTAGRAM STORY CANVAS */}
        <div className="w-full flex justify-center">
          <div 
            ref={cardRef}
            className="w-full aspect-[9/16] rounded-[32px] overflow-hidden relative select-none shadow-2xl bg-white flex flex-col justify-between"
            style={{ minHeight: "600px", maxHeight: "800px" }}
          >
            
            {/* 1. SPOTIFY WRAPPED */}
            {activeTemplate === "spotify" && (
              <div className="absolute inset-0 bg-[#1DB954] text-black p-8 flex flex-col overflow-hidden">
                <div className="absolute -top-20 -right-20 text-[200px] opacity-20 rotate-12">🎧</div>
                <p className="text-xl font-black tracking-tighter uppercase mt-4">2026 Wrapped</p>
                
                <div className="mt-auto mb-12 relative z-10">
                  <p className="text-2xl font-black uppercase tracking-tight">Top Borrower</p>
                  <h1 className="text-[80px] leading-none font-black tracking-tighter -ml-1">
                    {DATA.name}
                  </h1>
                  
                  <div className="mt-8 space-y-4">
                    <div className="bg-black text-[#1DB954] p-4 rounded-2xl rotate-2 shadow-xl border-4 border-black">
                      <p className="text-sm font-black uppercase">Rupees Held Hostage</p>
                      <p className="text-6xl font-black tracking-tighter">₹{DATA.amount}</p>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="bg-[#bcff4f] text-black p-4 rounded-2xl -rotate-3 border-4 border-black flex-1 shadow-xl">
                        <p className="text-xs font-black uppercase">Days Ignored</p>
                        <p className="text-4xl font-black">{DATA.days}</p>
                      </div>
                      <div className="bg-white text-black p-4 rounded-2xl rotate-2 border-4 border-black flex-1 shadow-xl">
                        <p className="text-xs font-black uppercase">Top Genre</p>
                        <p className="text-xl font-black leading-tight mt-1">Financial Ghosting</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. DUOLINGO THREAT */}
            {activeTemplate === "duo" && (
              <div className="absolute inset-0 bg-[#58CC02] text-white p-8 flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                <div className="relative z-10 space-y-8 w-full">
                  <div className="text-[120px] animate-bounce drop-shadow-2xl">🦉</div>
                  <div className="bg-white text-black rounded-3xl p-6 relative shadow-2xl border-b-8 border-neutral-200">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rotate-45" />
                    <h2 className="text-5xl font-black tracking-tighter uppercase leading-none text-rose-500">
                      RETURN THE MONEY.
                    </h2>
                    <p className="text-xl font-black mt-4 uppercase">or else, {DATA.name}.</p>
                  </div>
                  
                  <div className="bg-black/20 p-6 rounded-3xl backdrop-blur-sm border-2 border-white/30">
                    <p className="text-lg font-black uppercase tracking-wider text-lime-100">Your streak of not paying me back:</p>
                    <div className="flex items-center justify-center gap-4 mt-2">
                      <span className="text-6xl">🔥</span>
                      <span className="text-7xl font-black tracking-tighter">{DATA.days} DAYS</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. NETFLIX DOCUMENTARY */}
            {activeTemplate === "netflix" && (
              <div className="absolute inset-0 bg-black text-white p-6 flex flex-col justify-end pb-12">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-rose-900/40" />
                <div className="absolute top-8 left-1/2 -translate-x-1/2">
                  <div className="text-rose-600 font-black text-3xl tracking-tighter flex items-center gap-2">
                    <span className="text-5xl">N</span> NETFLIX
                  </div>
                </div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-center gap-2 text-rose-600 font-black tracking-widest text-sm">
                    <span>#1 IN INDIA TODAY</span>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xl font-bold tracking-widest uppercase text-neutral-400">The Disappearance of</p>
                    <h1 className="text-[90px] leading-[0.85] font-black tracking-tighter text-rose-600 drop-shadow-[0_0_30px_rgba(225,29,72,0.6)] mt-2">
                      ₹{DATA.amount}
                    </h1>
                  </div>

                  <p className="text-center text-lg font-bold text-neutral-300 px-4">
                    A gripping true-crime series about a man named {DATA.name} who said "I'll pay you tomorrow" {DATA.days} days ago.
                  </p>

                  <div className="flex gap-4 pt-4">
                    <div className="bg-white text-black flex-1 py-4 rounded-xl font-black text-xl text-center flex items-center justify-center gap-2">
                      <span>▶</span> Play Episode {DATA.days}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. TINDER PROFILE */}
            {activeTemplate === "tinder" && (
              <div className="absolute inset-0 bg-neutral-900 p-4 flex flex-col">
                <div className="text-rose-500 font-black text-2xl text-center py-4 flex items-center justify-center gap-2">
                  <span>🔥</span> tinder
                </div>
                <div className="flex-1 bg-white rounded-3xl relative overflow-hidden shadow-2xl border-4 border-neutral-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                  <div className="absolute inset-0 bg-rose-500/20" /> {/* Fake photo background */}
                  
                  <div className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded-full font-black text-sm z-20 shadow-lg rotate-12">
                    🚩 RED FLAG
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white space-y-4">
                    <h2 className="text-6xl font-black tracking-tighter flex items-end gap-4">
                      {DATA.name} <span className="text-3xl font-medium">24</span>
                    </h2>
                    <div className="bg-rose-500 text-white px-4 py-2 rounded-lg font-black inline-block text-lg">
                      Owes me: ₹{DATA.amount}
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t border-white/20">
                      <p className="text-xl font-bold flex items-center gap-2"><span>✅</span> Enjoys: Borrowing money</p>
                      <p className="text-xl font-bold flex items-center gap-2"><span>❌</span> Avoids: UPI Payments</p>
                      <p className="text-xl font-bold flex items-center gap-2"><span>👻</span> Ghosting Streak: {DATA.days} days</p>
                    </div>

                    <div className="flex justify-center gap-6 pt-6">
                      <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-rose-500 flex items-center justify-center text-3xl">❌</div>
                      <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-emerald-500 flex items-center justify-center text-3xl">⭐</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. FBI WANTED */}
            {activeTemplate === "fbi" && (
              <div className="absolute inset-0 bg-[#E8DCC4] p-6 flex flex-col border-[16px] border-[#3E2723]">
                <div className="border-4 border-[#3E2723] h-full p-4 flex flex-col relative">
                  
                  <div className="absolute -top-6 -right-6 bg-red-600 text-white font-black px-6 py-2 rotate-[15deg] border-4 border-black text-2xl shadow-xl">
                    ARMED & BROKE
                  </div>

                  <div className="text-center space-y-2 mb-6">
                    <h1 className="text-6xl font-black tracking-widest font-serif text-[#3E2723]">WANTED</h1>
                    <p className="text-xl font-black tracking-widest border-y-4 border-[#3E2723] py-2">BY THE DEBT COLLECTION AGENCY</p>
                  </div>

                  <div className="flex-1 border-4 border-[#3E2723] bg-neutral-300/50 mb-6 flex items-center justify-center">
                    <span className="text-[120px] grayscale opacity-50">👤</span>
                  </div>

                  <h2 className="text-6xl font-black text-center tracking-tighter uppercase mb-6 text-[#3E2723]">
                    {DATA.name}
                  </h2>

                  <div className="space-y-4 font-serif font-black text-lg text-[#3E2723]">
                    <div className="flex justify-between border-b-2 border-[#3E2723]/30 pb-1">
                      <span>CRIME:</span> <span className="text-red-700 text-2xl">STEALING ₹{DATA.amount}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-[#3E2723]/30 pb-1">
                      <span>LAST SEEN:</span> <span>Saying "Tomorrow Bro"</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-[#3E2723]/30 pb-1">
                      <span>TIME AT LARGE:</span> <span>{DATA.days} DAYS</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. POKEMON CARD */}
            {activeTemplate === "pokemon" && (
              <div className="absolute inset-0 bg-[#FACC15] p-4 flex flex-col">
                <div className="border-[12px] border-[#EAB308] h-full rounded-2xl bg-white p-4 flex flex-col shadow-inner relative overflow-hidden">
                  
                  {/* Holographic effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-cyan-500/20 to-yellow-500/20 pointer-events-none z-20 mix-blend-overlay" />

                  <div className="flex justify-between items-end border-b-4 border-black pb-2">
                    <h2 className="text-4xl font-black uppercase tracking-tighter">{DATA.name}</h2>
                    <div className="text-3xl font-black text-rose-600 flex items-center">
                      <span className="text-sm mr-1">HP</span>{DATA.amount}
                    </div>
                  </div>

                  <div className="h-64 bg-neutral-200 border-8 border-neutral-300 my-4 shadow-inner flex items-center justify-center relative">
                    <div className="text-[120px]">🤡</div>
                    <div className="absolute bottom-2 right-2 bg-black text-white text-xs font-black px-2 py-1">Basic Brokie</div>
                  </div>

                  <div className="bg-neutral-100 p-4 border-4 border-black flex-1 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1"><span className="w-6 h-6 rounded-full bg-neutral-800" /><span className="w-6 h-6 rounded-full bg-neutral-800" /></div>
                      <div>
                        <h3 className="font-black text-2xl">"Next Week Bro"</h3>
                        <p className="text-sm font-bold leading-tight">Deals 0 damage. Deflects all UPI requests for {DATA.days} days.</p>
                      </div>
                    </div>
                    <hr className="border-black/20 border-2" />
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1"><span className="w-6 h-6 rounded-full bg-rose-500" /></div>
                      <div>
                        <h3 className="font-black text-2xl">Financial Ghost</h3>
                        <p className="text-sm font-bold leading-tight">Disappears when restaurant bill arrives. Unblockable.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. LINKEDIN ACHIEVEMENT */}
            {activeTemplate === "linkedin" && (
              <div className="absolute inset-0 bg-[#F3F2EF] p-6 flex flex-col text-[#000000]/90">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-neutral-200 mt-12 relative">
                  
                  <div className="absolute -top-10 left-6 w-20 h-20 bg-[#0A66C2] rounded-full flex items-center justify-center text-white font-black text-4xl shadow-xl border-4 border-white">
                    in
                  </div>

                  <div className="mt-8 space-y-6">
                    <p className="text-lg font-medium leading-relaxed">
                      I’m thrilled to announce that <span className="font-black text-[#0A66C2]">{DATA.name}</span> has reached a massive milestone in their career! 🎉
                    </p>

                    <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl p-6 text-center space-y-4">
                      <div className="text-6xl">🏆</div>
                      <h3 className="text-2xl font-black text-[#0A66C2] uppercase">Certified Professional Borrower</h3>
                      <p className="text-xl font-bold">Outstanding Balance: ₹{DATA.amount}</p>
                      <div className="bg-rose-100 text-rose-700 font-black px-4 py-2 rounded-full inline-block">
                        Streak: {DATA.days} Days Ignored
                      </div>
                    </div>

                    <p className="text-lg font-medium text-neutral-600">
                      It takes extreme dedication to avoid opening my WhatsApp messages for this long. Please join me in congratulating them! 👇
                    </p>

                    <div className="flex items-center gap-4 text-neutral-500 border-t pt-4">
                      <span className="flex items-center gap-1 font-bold text-lg text-[#0A66C2]">👍 14.2k</span>
                      <span className="flex items-center gap-1 font-bold text-lg">💡 892</span>
                      <span className="flex items-center gap-1 font-bold text-lg">😂 4.5k</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. BOSS BATTLE */}
            {activeTemplate === "boss" && (
              <div className="absolute inset-0 bg-[#0F0F1A] p-6 flex flex-col items-center justify-between text-white border-8 border-purple-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
                
                <div className="w-full space-y-2 mt-8 relative z-10">
                  <h2 className="text-center font-black tracking-widest text-rose-500 text-2xl animate-pulse">FINAL BOSS APPEARED</h2>
                  <div className="bg-neutral-900 border-4 border-neutral-700 p-2 rounded-xl">
                    <div className="flex justify-between font-black mb-1 px-2 text-xl">
                      <span className="uppercase">{DATA.name}</span>
                      <span className="text-rose-500">HP: ₹{DATA.amount}</span>
                    </div>
                    <div className="h-6 bg-neutral-950 rounded-full p-1 border-2 border-black">
                      <div className="h-full bg-gradient-to-r from-rose-700 to-rose-500 w-[100%] rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 w-1/2 skew-x-12 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[180px] filter drop-shadow-[0_0_30px_rgba(168,85,247,0.8)] relative z-10 hover:scale-110 transition-transform">
                  👿
                </div>

                <div className="w-full grid grid-cols-2 gap-4 relative z-10 mb-8">
                  <div className="bg-neutral-900 border-4 border-neutral-700 p-4 rounded-xl text-center active:scale-95">
                    <p className="font-black text-2xl text-white">ATTACK</p>
                    <p className="text-xs font-bold text-neutral-400 mt-1">(Send Nudge)</p>
                  </div>
                  <div className="bg-neutral-900 border-4 border-neutral-700 p-4 rounded-xl text-center opacity-50">
                    <p className="font-black text-2xl text-white">FLEE</p>
                    <p className="text-xs font-bold text-neutral-400 mt-1">(Give Up)</p>
                  </div>
                  <div className="col-span-2 bg-rose-950 border-4 border-rose-500 p-4 rounded-xl text-center">
                    <p className="font-black text-lg text-rose-200 uppercase">Status Effect Active</p>
                    <p className="font-bold text-white text-xl">Target immune to texts for {DATA.days} days</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleNext}
            className="w-full bg-white text-black hover:bg-neutral-50 border-2 border-black font-black text-sm uppercase tracking-wide rounded-xl py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Shuffle className="h-5 w-5" /> Roll Next
          </Button>
          <Button 
            disabled={exporting}
            onClick={handleExport}
            className="w-full bg-[#bcff4f] hover:bg-[#a6e63b] text-black font-black text-sm uppercase tracking-wide border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="h-5 w-5" /> {exporting ? "Saving..." : "Share Meme"}
          </Button>
        </div>

      </div>
    </div>
  );
}