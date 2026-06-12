"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Calendar, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface Friend {
  id: string;
  name: string;
  emoji: string;
  avatar_color: string;
}

export default function AddDebtPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Real database dropdown list state reference array
  const [friends, setFriends] = useState<Friend[]>([]);

  // Controlled Form Inputs
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [item, setItem] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const checkAuthAndFetchFriends = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setCheckingAuth(false);
      setLoadingFriends(true);

      try {
        const { data, error } = await supabase
          .from("debtors")
          .select("id, name, emoji, avatar_color")
          .order("name", { ascending: true });

        if (error) throw error;
        setFriends(data || []);
      } catch (err) {
        console.error("Error loading dropdown data options:", err);
      } finally {
        setLoadingFriends(false);
      }
    };

    checkAuthAndFetchFriends();
  }, [router]);

  const handleSaveDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriendId) return alert("Please select a friend first!");
    if (!amount || Number(amount) <= 0) return alert("Please specify a valid loan balance amount!");
    if (!item.trim()) return alert("What expense item is this transaction tracking?");

    setSubmitLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user profile context session parsed.");

      const { error } = await supabase.from("debts").insert({
        user_id: user.id, // Explicit user context boundary registration
        debtor_id: selectedFriendId,
        item: item.trim(),
        amount: Math.floor(Number(amount)),
        notes: notes.trim() || null,
        is_paid: false,
      });

      if (error) throw error;

      router.push("/"); // Direct validation baseline routing home
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to commit ledger entry row.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f3efff] flex items-center justify-center font-black text-neutral-400 text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Verification Loop active...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3efff] text-neutral-900 font-sans antialiased flex flex-col justify-between md:py-8 md:px-4">
      <div className="w-full max-w-xl mx-auto bg-[#f3efff] md:bg-white md:rounded-[32px] md:shadow-xl md:border-2 md:border-neutral-200 flex flex-col min-h-screen md:min-h-[820px] md:h-[820px] justify-between overflow-y-auto">
        
        <form onSubmit={handleSaveDebt} className="flex flex-col justify-between h-full flex-1">
          <div className="p-6 space-y-6">
            <header className="flex items-center justify-between pt-2">
              <Link href="/">
                <Button type="button" variant="ghost" size="icon" className="rounded-full text-neutral-800">
                  <X className="h-6 w-6 stroke-[2.5]" />
                </Button>
              </Link>
              <span className="text-lg font-black tracking-tight text-neutral-900">add debt</span>
              <div className="w-10"></div>
            </header>

            <div className="flex flex-col items-center justify-center py-2 relative select-none">
              <div className="bg-white border-2 border-black px-4 py-2 rotate-[-4deg] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl relative z-10">
                <p className="text-xl font-black tracking-tight text-center leading-none uppercase">
                  CHILL, <br />
                  <span className="text-lime-600">I GOT YOU</span> [cite: 146]
                </p>
              </div>
            </div>

            <Card className="bg-white border-none md:border md:border-neutral-100 shadow-none space-y-5 p-1">
              <CardContent className="p-0 space-y-5">
                
                {/* Horizontal Selection Picker Track Row */}
                <div className="space-y-2">
                  <label className="text-xs font-black tracking-wide text-neutral-400 uppercase block pl-1">
                    who owes you? 
                  </label>
                  {loadingFriends ? (
                    <div className="text-xs font-bold text-neutral-400 py-2">Loading context rows...</div>
                  ) : friends.length === 0 ? (
                    <div className="text-xs font-bold text-rose-500 pl-1">
                      No friends found!{" "}
                      <Link href="/add-friend" className="underline font-black text-black">
                        Create one first ➡️
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
                      {friends.map((friend) => {
                        const isSelected = selectedFriendId === friend.id;
                        return (
                          <button
                            key={friend.id}
                            type="button"
                            onClick={() => setSelectedFriendId(friend.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition-all shrink-0 active:scale-95 ${
                              isSelected 
                                ? "border-black bg-neutral-950 text-white shadow-[2px_2px_0px_0px_rgba(188,255,79,1)]" 
                                : "border-neutral-200 bg-neutral-50 hover:border-neutral-400"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isSelected ? "bg-white/20 text-white" : friend.avatar_color
                            }`}>
                              {friend.emoji}
                            </div>
                            <span className="text-sm font-extrabold pr-1">{friend.name}</span>
                            {isSelected && <Check className="h-4 w-4 text-[#bcff4f] stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black tracking-wide text-neutral-400 uppercase block pl-1">
                    amount
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-lg font-black text-neutral-800 select-none">₹</span>
                    <input 
                      type="number" 
                      required
                      placeholder="500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-neutral-50/80 border-2 border-neutral-200 focus:border-black focus:bg-white rounded-2xl py-3.5 pl-9 pr-4 text-sm font-extrabold transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black tracking-wide text-neutral-400 uppercase block pl-1">
                    for what?
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Dinner at Barbeque Nation"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    className="w-full bg-neutral-50/80 border-2 border-neutral-200 focus:border-black focus:bg-white rounded-2xl py-3.5 px-4 text-sm font-extrabold transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black tracking-wide text-neutral-400 uppercase block pl-1">
                    notes (optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="He said next time pakka 🥲 [cite: 146]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-neutral-50/80 border-2 border-neutral-200 focus:border-black focus:bg-white rounded-2xl py-3.5 px-4 text-sm font-extrabold transition-all outline-none"
                  />
                </div>

              </CardContent>
            </Card>
          </div>

          <div className="p-6 bg-[#f3efff] md:bg-white sticky bottom-0 z-10 border-t border-transparent md:border-neutral-100">
            <Button 
              type="submit"
              disabled={submitLoading}
              className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm py-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(188,255,79,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none rounded-xl tracking-wide uppercase"
            >
              {submitLoading ? "Recording Entry..." : "save debt"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}