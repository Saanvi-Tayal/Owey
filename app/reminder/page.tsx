"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Shuffle, Share2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import vibeTemplates from "@/reminders.json"; // Dynamically calling your centralized JSON copy bank

export default function SendReminderPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeVibe, setActiveVibe] = useState("nice");
  const [templateIndex, setTemplateIndex] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  // Read dynamically from the JSON template configuration bank using the active tab selection state
  const currentTexts = vibeTemplates[activeVibe as keyof typeof vibeTemplates] || [];
  const activeMessage = currentTexts[templateIndex % currentTexts.length] || "Hey! Just checking in about our balances.";

  const handleRandomize = () => {
    setTemplateIndex((prev) => prev + 1);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(activeMessage);
      alert("Text message copied to clipboard! 📋");
    } catch (err) {
      console.error("Clipboard failure:", err);
    }
  };

  // Forms a browser-native WhatsApp deep link string to pass the notification instantly
  const handleSendWhatsAppText = () => {
    const encodedMessage = encodeURIComponent(activeMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank"); // Opens a clean native message chat modal shell
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-black text-neutral-400 text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-600" /> Connecting Reminders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-white min-h-screen sm:min-h-0 sm:rounded-[36px] sm:border-2 sm:border-neutral-200/80 sm:shadow-xl p-6 flex flex-col justify-between space-y-6">
          
          <div className="space-y-6">
            <header className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full text-neutral-800">
                  <ArrowLeft className="h-6 w-6 stroke-[2.5]" />
                </Button>
              </Link>
              <h1 className="text-xl font-black tracking-tight">send reminder</h1>
            </header>

            <div className="space-y-2">
              <label className="text-xs font-black tracking-wide text-neutral-400 uppercase block pl-1">
                choose your vibe 😎
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {["nice", "funny", "savage", "nuclear"].map((vibe) => {
                  const isActive = activeVibe === vibe;
                  const vibeColors: Record<string, string> = {
                    nice: "bg-lime-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    funny: "bg-purple-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    savage: "bg-rose-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    nuclear: "bg-orange-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  };
                  return (
                    <button
                      key={vibe}
                      onClick={() => {
                        setActiveVibe(vibe);
                        setTemplateIndex(0);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 shrink-0 ${
                        isActive
                          ? vibeColors[vibe] + " border-black"
                          : "bg-neutral-50 text-neutral-400 border-neutral-200/70 hover:border-neutral-300"
                      }`}
                    >
                      {vibe}
                    </button>
                  );
                })}
              </div>
            </div>

            <Card className="bg-[#e4dcff] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-3xl overflow-hidden relative min-h-[180px] flex flex-col justify-between p-6">
              <CardContent className="p-0">
                <p className="text-base font-extrabold text-neutral-900 leading-relaxed max-w-[90%]">
                  {activeMessage}
                </p>
              </CardContent>
              <div className="absolute bottom-3 right-4 text-5xl select-none opacity-80 pointer-events-none">
                🧑‍🎤
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleRandomize}
                className="bg-white border-2 border-black font-black text-xs uppercase tracking-wide rounded-xl py-5 shadow-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Shuffle className="mr-1.5 h-4 w-4 stroke-[2.5]" /> randomize
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyToClipboard}
                className="bg-white border-2 border-black font-black text-xs uppercase tracking-wide rounded-xl py-5 shadow-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Copy className="mr-1.5 h-4 w-4 stroke-[2.5]" /> copy text
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleSendWhatsAppText}
              className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm py-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(188,255,79,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none rounded-xl tracking-wide uppercase"
            >
              <Share2 className="mr-2 h-4 w-4 stroke-[2.5]" /> send text on whatsapp
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}