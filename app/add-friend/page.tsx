"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const AVAILABLE_AVATARS = [
  { id: "a1", emoji: "😎", bg: "bg-purple-200 text-purple-700" },
  { id: "a2", emoji: "🤓", bg: "bg-yellow-200 text-yellow-700" },
  { id: "a3", emoji: "🤠", bg: "bg-teal-200 text-teal-700" },
  { id: "a4", emoji: "🦊", bg: "bg-orange-200 text-orange-700" },
];

export default function AddFriendPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("a1");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
        } else {
          setCheckingAuth(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const handleSaveFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter a name!");
    
    setLoading(true);
    try {
      // Fetch the active user session directly from the client instance
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Your session expired. Please log back in.");
      }

      const avatar = AVAILABLE_AVATARS.find((a) => a.id === selectedAvatar) || AVAILABLE_AVATARS[0];

      // Insert transaction execution row containing user_id metadata
      const { error: insertError } = await supabase.from("debtors").insert([
        {
          user_id: user.id, // Explicitly pass user context tracking ID for RLS rules
          name: name.trim(),
          emoji: avatar.emoji,
          avatar_color: avatar.bg,
          repayment_rate: 100, // Safe default state ratio
          days_avg: 0,
        }
      ]);

      if (insertError) throw insertError;

      // Force a router refresh so the home screen queries the cloud instantly
      router.push("/");
      setTimeout(() => {
        router.refresh();
      }, 100);

    } catch (err: any) {
      console.error("Database insertion failed:", err);
      alert(err.message || "Failed to save profile context entry.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f3efff] flex items-center justify-center font-black text-neutral-400 text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-600" /> Authorizing Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3efff] text-neutral-900 font-sans antialiased flex flex-col justify-between md:py-8 md:px-4">
      <div className="w-full max-w-xl mx-auto bg-[#f3efff] md:bg-white md:rounded-[32px] md:shadow-xl md:border-2 md:border-neutral-200 flex flex-col min-h-screen md:min-h-[750px] md:h-[750px] justify-between overflow-y-auto">
        
        <form onSubmit={handleSaveFriend} className="flex flex-col justify-between h-full flex-1">
          <div className="p-6 space-y-6">
            <header className="flex items-center justify-between pt-2">
              <Link href="/">
                <Button type="button" variant="ghost" size="icon" className="rounded-full text-neutral-800">
                  <X className="h-6 w-6 stroke-[2.5]" />
                </Button>
              </Link>
              <span className="text-lg font-black tracking-tight text-neutral-900">add friend</span>
              <div className="w-10"></div>
            </header>

            <div className="flex flex-col items-center justify-center py-4 relative select-none">
              <div className="bg-[#bcff4f] border-2 border-black px-5 py-3 rotate-[3deg] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl relative z-10 max-w-[240px]">
                <p className="text-sm font-black tracking-tight text-neutral-900 leading-snug text-center">
                  borrowing is easy, paying back is art. 🎨
                </p>
              </div>
            </div>

            <Card className="bg-white border-none md:border md:border-neutral-100 shadow-none space-y-6 p-1">
              <CardContent className="p-0 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black tracking-wide text-neutral-400 uppercase block pl-1">
                    name
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Rohan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-50/80 border-2 border-neutral-200 focus:border-black focus:bg-white rounded-2xl py-3.5 px-4 text-sm font-extrabold transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black tracking-wide text-neutral-400 uppercase block pl-1">
                    choose avatar
                  </label>
                  <div className="flex items-center gap-3.5 pt-1 overflow-x-auto no-scrollbar">
                    {AVAILABLE_AVATARS.map((avatar) => {
                      const active = selectedAvatar === avatar.id;
                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar.id)}
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all border-2 active:scale-90 relative ${
                            active 
                              ? "border-black scale-105 shadow-[0_0_0_2px_rgba(188,255,79,1)]" 
                              : "border-neutral-200/70 hover:border-neutral-400"
                          } ${avatar.bg}`}
                        >
                          {avatar.emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-6 bg-[#f3efff] md:bg-white sticky bottom-0 z-10 border-t border-transparent md:border-neutral-100">
            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm py-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(188,255,79,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none rounded-xl tracking-wide uppercase"
            >
              {loading ? "Saving context..." : "save friend"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}