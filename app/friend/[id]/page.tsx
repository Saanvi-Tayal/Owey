"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical, Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface DebtorProfile {
  id: string;
  name: string;
  emoji: string;
  avatar_color: string;
  repayment_rate: number;
  days_avg: number;
}

interface DebtItem {
  id: string;
  item: string;
  amount: number;
  is_paid: boolean;
  created_at: string;
}

export default function FriendHistoryPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = React.use(params);

  // Database application states
  const [profile, setProfile] = useState<DebtorProfile | null>(null);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // 1. Fetch friend details matching the URL parameter ID
      const { data: debtorData, error: debtorError } = await supabase
        .from("debtors")
        .select("id, name, emoji, avatar_color, repayment_rate, days_avg")
        .eq("id", id)
        .single();

      if (debtorError || !debtorData) {
        console.error("Error loading profile:", debtorError);
        router.push("/");
        return;
      }

      // 2. Fetch all historical ledger items for this individual friend
      const { data: debtsData, error: debtsError } = await supabase
        .from("debts")
        .select("id, item, amount, is_paid, created_at")
        .eq("debtor_id", id)
        .order("created_at", { ascending: false });

      if (!debtsError && debtsData) {
        setDebts(debtsData);
      }

      setProfile(debtorData);
    } catch (err) {
      console.error("Critical failure gathering ledger properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, router]);

  // Handler to clear a specific debt item directly on this page
  const handleClearDebt = async (debtId: string) => {
    setActionLoading(debtId);
    try {
      const { error } = await supabase
        .from("debts")
        .update({ is_paid: true })
        .eq("id", debtId);

      if (error) throw error;

      // Optimistically update the local ledger state immediately
      setDebts(prev =>
        prev.map(d => (d.id === debtId ? { ...d, is_paid: true } : d))
      );

      // Refresh the system routers to sync global totals
      router.refresh();
    } catch (err) {
      console.error("Settle transaction exception:", err);
      alert("Could not update transaction state parameters.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-black text-neutral-400 text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-600" /> Pulling private history...
      </div>
    );
  }

  if (!profile) return null;

  // Compute live local remaining metrics
  const activeUnpaidDebts = debts.filter(d => !d.is_paid);
  const totalOutstandingBalance = activeUnpaidDebts.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased">
      <div className="max-w-3xl mx-auto p-0 sm:p-6 md:p-8">
        
        <div className="bg-white min-h-screen sm:min-h-0 sm:rounded-[36px] sm:border-2 sm:border-neutral-200/80 sm:shadow-xl overflow-hidden flex flex-col justify-between">
          
          <div>
            {/* Top Interactive Context Header Bar */}
            <div className={`p-6 text-black space-y-6 relative ${profile.avatar_color || 'bg-purple-100'}`}>
              <div className="flex items-center justify-between">
                <Link href="/" passHref>
                  <Button variant="ghost" size="icon" className="rounded-full text-current hover:bg-black/10">
                    <ArrowLeft className="h-6 w-6 stroke-[2.5]" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="rounded-full text-current hover:bg-black/10">
                  <MoreVertical className="h-6 w-6" />
                </Button>
              </div>

              {/* Profile Context Banner */}
              <div className="flex items-center gap-4 pb-2">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-md border-2 border-black/5">
                  {profile.emoji}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight">{profile.name}</h1>
                    <span className="text-xl">😎</span>
                  </div>
                  <div className="bg-black/10 px-3 py-0.5 rounded-full text-xs font-black inline-block text-black/80">
                    verified borrower 🧑‍💻
                  </div>
                </div>
              </div>
            </div>

            {/* Total Balance Outstanding Component Box */}
            <div className="p-6 -mt-4 relative z-10">
              <Card className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-0.5">
                      owes you
                    </p>
                    <p className="text-4xl font-black tracking-tight text-neutral-900">
                      ₹{totalOutstandingBalance.toLocaleString("en-IN")}
                    </p>
                  </div>
                  
                  {/* Detailed Performance Metric Matrix */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-100 text-center">
                    <div>
                      <p className="text-lg font-black text-neutral-900">{activeUnpaidDebts.length}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">debts</p>
                    </div>
                    <div className="border-x border-neutral-100">
                      <p className="text-lg font-black text-neutral-900">{profile.days_avg || 0}d</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">days avg.</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-lime-600">{profile.repayment_rate || 100}%</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">repayment rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tab Navigation Segment */}
              <div className="flex items-center bg-neutral-100 p-1 rounded-xl mt-6 gap-1 border border-neutral-200/50">
                <button type="button" className="flex-1 text-center font-black text-xs py-2.5 bg-white rounded-lg shadow-sm border border-black/5 text-neutral-900">
                  open debts
                </button>
              </div>

              {/* Connected Live Dynamic Expenses Log */}
              <div className="mt-5 space-y-3">
                {debts.length === 0 ? (
                  <p className="text-center text-xs font-bold text-neutral-400 py-8">
                    No logs recorded. This user doesn't owe you anything! ☀️
                  </p>
                ) : (
                  debts.map((item) => (
                    <div 
                      key={item.id}
                      className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${
                        item.is_paid 
                          ? "bg-neutral-50/40 border-neutral-100 opacity-60 animate-fade-in" 
                          : "bg-white border-neutral-200/80 hover:border-black"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base ${
                          item.is_paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {item.is_paid ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className={`font-extrabold text-sm text-neutral-900 ${item.is_paid ? "line-through text-neutral-400" : ""}`}>
                            {item.item}
                          </h4>
                          <p className="text-[11px] font-semibold text-neutral-400">
                            {new Date(item.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-right">
                        <span className={`font-black text-sm ${item.is_paid ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                          ₹{item.amount}
                        </span>
                        
                        {/* Interactive Clear action rendering inline */}
                        {!item.is_paid ? (
                          <Button
                            size="sm"
                            disabled={actionLoading === item.id}
                            onClick={() => handleClearDebt(item.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wide rounded-lg px-2.5 py-1 h-auto border border-emerald-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                          >
                            {actionLoading === item.id ? "..." : "Clear"}
                          </Button>
                        ) : (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded tracking-tight uppercase bg-neutral-100 text-neutral-400">
                            Paid
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Agent Alert Widget Module Nudge Link */}
              {/* Agent Alert Widget Module Nudge Link */}
<div className="mt-6 p-4 bg-lime-50 rounded-2xl border-2 border-dashed border-lime-400 flex items-center justify-between">
  <div className="space-y-0.5">
    <h5 className="text-xs font-black text-lime-900 uppercase tracking-wider">Owey Meme Generator</h5>
    <p className="text-[11px] font-medium text-lime-700">Need to nudge {profile.name}? Generate a viral call-out card.</p>
  </div>
  
  {/* Dynamically passing the friend's data into the share page URL */}
  <Link 
    href={`/share?name=${encodeURIComponent(profile.name)}&amount=${totalOutstandingBalance}&days=${profile.days_avg || 31}`}
  >
    <Button size="sm" className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border border-black px-3 active:translate-x-0.5 active:translate-y-0.5 transition-all">
      Create Meme
    </Button>
  </Link>
</div>
              {/* <div className="mt-6 p-4 bg-lime-50 rounded-2xl border-2 border-dashed border-lime-400 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-black text-lime-900 uppercase tracking-wider">Owey Agent Active</h5>
                  <p className="text-[11px] font-medium text-lime-700">Need to nudge {profile.name}? Build a clean reminder card banner payload.</p>
                </div>
                <Link href="/reminder">
                  <Button size="sm" className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-md border border-black px-3">
                    Nudge
                  </Button>
                </Link>
              </div> */}

            </div>
          </div>

          {/* Bottom Persistent Add Debt Floating Base Container */}
          <div className="p-6 bg-gradient-to-t from-white via-white to-transparent sticky bottom-0 z-10 mt-4">
            <Link href="/add-debt" passHref>
              <Button className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-black text-sm py-5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(188,255,79,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none rounded-xl">
                <Plus className="mr-1.5 h-4 w-4 stroke-[3]" /> add new debt
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}