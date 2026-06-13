"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Bell, Menu, Plus, TrendingUp, Users, LogOut, Loader2, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Debtor {
  id: string;
  name: string;
  emoji: string;
  avatar_color: string;
}

interface Debt {
  debtor_id: string;
  amount: number;
  is_paid: boolean;
}

export default function OweyDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Real-time application states
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [totalOwed, setTotalOwed] = useState(0);

  useEffect(() => {
    const checkUserAndFetch = async () => {
      // 1. Verify user session authorization state
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login"); // Kick out unauthorized traffic
        return;
      }
      setCheckingAuth(false);
      setLoadingData(true);

      try {
        // 2. Fetch the logged-in user's custom onboarding friends list
        const { data: debtorsData, error: debtorsError } = await supabase
          .from("debtors")
          .select("id, name, emoji, avatar_color");

        if (debtorsError) throw debtorsError;

        // 3. Fetch all active debt collection items
        const { data: debtsData, error: debtsError } = await supabase
          .from("debts")
          .select("debtor_id, amount, is_paid");

        if (debtsError) throw debtsError;

        // 4. Calculate dynamic outstanding ledger aggregate ratios in real-time
        const activeDebtors = debtorsData || [];
        const activeDebts = debtsData || [];

        const runningBalances: Record<string, number> = {};
        let calculatedTotal = 0;

        // Initialize balances for each friend at 0
        activeDebtors.forEach(d => {
          runningBalances[d.id] = 0;
        });

        // Sum up only the unpaid debts
        activeDebts.forEach((debt: Debt) => {
          if (!debt.is_paid && runningBalances[debt.debtor_id] !== undefined) {
            runningBalances[debt.debtor_id] += debt.amount;
            calculatedTotal += debt.amount;
          }
        });

        // Filter out debtors who owe money to rank them on the leaderboard, 
        // but keep all debtors in state to calculate the correct friend count metric
        setDebtors(activeDebtors);
        setBalances(runningBalances);
        setTotalOwed(calculatedTotal);
      } catch (err) {
        console.error("Failed to compile cloud parameters:", err);
      } finally {
        setLoadingData(false);
      }
    };

    checkUserAndFetch();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-black text-neutral-400 text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-600" /> Verifying Session...
      </div>
    );
  }

  // Sort debtors so the friends who owe you the most float to the top
  const leaderboardDebtors = [...debtors]
    .filter(d => (balances[d.id] || 0) > 0)
    .sort((a, b) => (balances[b.id] || 0) - (balances[a.id] || 0));

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12">

        {/* Header Section */}
        <header className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full -ml-2 text-neutral-800 md:hidden">
              <Menu className="h-6 w-6 stroke-[2.5]" />
            </Button>
            <span className="text-xl md:text-2xl font-black tracking-tight text-neutral-900">owey.</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/share">
              <Button className="bg-[#bcff4f] hover:bg-[#a6e63b] text-black font-black text-xs sm:text-sm uppercase tracking-wide border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2">
                🧪 Meme Vault
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="rounded-full h-10 w-10 text-neutral-500 hover:text-rose-500 hover:bg-rose-50"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Responsive Layout Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-start">

          {/* LEFT COLUMN: Balance Highlight & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 flex items-center gap-2">
                where's my money? <span className="animate-bounce text-2xl md:text-3xl">😉</span>
              </h1>
              <p className="text-xs md:text-sm text-neutral-500 font-bold tracking-wide uppercase">
                track. remind. get paid.
              </p>
            </div>

            {/* Dynamic Total Balance Box */}
            <Card className="bg-[#bcff4f] text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
              <CardContent className="p-6 md:p-8">
                <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-black/60 mb-1">
                  you're owed
                </p>
                <div className="flex items-baseline justify-between">
                  <span className="text-4xl md:text-5xl font-black tracking-tight">
                    ₹{totalOwed.toLocaleString("en-IN")}
                  </span>
                  <div className="text-3xl md:text-4xl select-none absolute bottom-4 right-4 opacity-90 pointer-events-none">
                    💵
                  </div>
                </div>
              </CardContent>
            </Card>
          

            {/* Form Routing Anchors */}
            <div className="space-y-3">
              <Link href="/add-debt" className="block">
                <Button className="w-full bg-[#bcff4f] hover:bg-[#a6e63b] text-black font-black text-sm md:text-base py-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none rounded-xl">
                  <Plus className="mr-1.5 h-4 w-4 md:h-5 md:w-5 stroke-[3]" /> add new debt
                </Button>
              </Link>

              <Link href="/add-friend" className="block">
                <Button variant="outline" className="w-full bg-white border-2 border-black font-black text-sm py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none rounded-xl text-neutral-900 hover:bg-neutral-50 flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4 stroke-[2.5]" /> onboard new friend
                </Button>
              </Link>
            </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
              <Link href="/activity" className="block group">
                <div className="bg-white border-2 border-neutral-200/60 group-hover:border-black p-4 rounded-2xl flex items-center gap-3 shadow-sm transition-all">
                  <Users className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-[10px] md:text-xs text-neutral-400 font-bold uppercase tracking-wider">Active Feed</p>
                    <p className="text-sm md:text-base font-black text-neutral-800">{debtors.length} friends</p>
                  </div>
                </div>
              </Link>
              <Link href="/stats" className="block group">
                <div className="bg-white border-2 border-neutral-200/60 group-hover:border-black p-4 rounded-2xl flex items-center gap-3 shadow-sm transition-all">
                  <TrendingUp className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-[10px] md:text-xs text-neutral-400 font-bold uppercase tracking-wider">Analytics</p>
                    <p className="text-sm md:text-base font-black text-neutral-800">Live Metrics</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          

          {/* RIGHT COLUMN: Real-Time Friend Leaderboard */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg md:text-xl font-black flex items-center gap-1.5 text-neutral-900">
                top debtors <span className="text-purple-600 text-sm md:text-base">😈</span>
              </h2>
              <Link href="/activity">
                <Button variant="link" className="text-neutral-400 hover:text-black font-bold p-0 text-xs md:text-sm">
                  see all activity
                </Button>
              </Link>
            </div>

            {loadingData ? (
              <div className="flex items-center justify-center py-12 text-xs font-bold text-neutral-400 gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400" /> Refreshing leaderboard...
              </div>
            ) : leaderboardDebtors.length === 0 ? (
              /* If no one owes money, show an empty state alert card */
              <Card className="bg-white border-2 border-dashed border-neutral-300 p-8 text-center rounded-2xl">
                <CardContent className="p-0 space-y-3">
                  <p className="text-4xl animate-bounce">👻</p>
                  <h3 className="font-black text-lg">Clean Slate!</h3>
                  <p className="text-xs font-medium text-neutral-400 max-w-sm mx-auto">
                    Nobody owes you anything right now. Click "onboard new friend" or "add new debt" to start log tracking!
                  </p>
                </CardContent>
              </Card>
            ) : (
              /* Render active balances dynamically */
              <div className="space-y-3">
                {leaderboardDebtors.map((debtor) => (
                  <Link key={debtor.id} href={`/friend/${debtor.id}`} className="block group">
                    <Card className="bg-white border-2 border-neutral-200/80 group-hover:border-black transition-all shadow-sm">
                      <CardContent className="p-4 md:p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl font-bold border border-black/5 ${debtor.avatar_color}`}>
                            {debtor.emoji}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base md:text-lg text-neutral-900 group-hover:text-lime-600 transition-colors">
                              {debtor.name}
                            </h3>
                            <p className="text-[11px] md:text-xs font-medium text-neutral-400">
                              owes you
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-base md:text-lg font-black text-neutral-900">
                            ₹{(balances[debtor.id] || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Quick Metrics View Links */}
          
             <MemeSneakPeek />
          </div>
          

        </main>
      </div>
    </div>
  );
}
function MemeSneakPeek() {
  return (
    <div className="bg-white border-2 border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-lg flex items-center gap-2">
          🧪 Meme Vault <span className="text-xs bg-[#bcff4f] px-2 py-0.5 rounded-full border border-black">NEW</span>
        </h3>
        <Link href="/share" className="text-xs font-bold underline hover:text-purple-600">See All 52</Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['/memes/Slice 10.png', '/memes/Slice 2.png', '/memes/Slice 7.png'].map((src, i) => (
          <div key={i} className="aspect-square bg-neutral-100 rounded-xl overflow-hidden border-2 border-neutral-200">
            <img src={src} alt="meme" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs font-bold text-neutral-500 text-center uppercase tracking-wider">
        Nudge friends, don't nag them.
      </p>
    </div>
  );
}