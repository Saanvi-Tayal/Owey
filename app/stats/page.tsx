"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, Loader2, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function StatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Real database analytical values
  const [totalLent, setTotalLent] = useState(0);
  const [totalRecovered, setTotalRecovered] = useState(0);
  const [successRate, setSuccessRate] = useState(100);
  const [biggestDebtor, setBiggestDebtor] = useState<{ name: string; amount: number; emoji: string } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        // 1. Grab all historical loans to compute lifetime parameters
        const { data: debts, error: debtsError } = await supabase
          .from("debts")
          .select("debtor_id, amount, is_paid, debtors(name, emoji)");

        if (debtsError) throw debtsError;

        const allDebts = debts || [];
        let lentSum = 0;
        let recoveredSum = 0;
        const debtorBalances: Record<string, { name: string; amount: number; emoji: string }> = {};

        allDebts.forEach((d: any) => {
          lentSum += d.amount;
          if (d.is_paid) {
            recoveredSum += d.amount;
          } else if (d.debtors) {
            // Aggregate remaining balances for active leaderboard ranking
            const id = d.debtor_id;
            if (!debtorBalances[id]) {
              debtorBalances[id] = { name: d.debtors.name, amount: 0, emoji: d.debtors.emoji || "😈" };
            }
            debtorBalances[id].amount += d.amount;
          }
        });

        // Calculate Success Rate cleanly
        const calculatedRate = lentSum > 0 ? Math.round((recoveredSum / lentSum) * 100) : 100;

        // Determine Biggest Debtor
        let championDebtor = null;
        let maxOwed = 0;
        Object.values(debtorBalances).forEach(debtor => {
          if (debtor.amount > maxOwed) {
            maxOwed = debtor.amount;
            championDebtor = debtor;
          }
        });

        setTotalLent(lentSum);
        setTotalRecovered(recoveredSum);
        setSuccessRate(calculatedRate);
        setBiggestDebtor(championDebtor);
      } catch (err) {
        console.error("Failed to parse runtime stats metrics:", err);
      } {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-black text-neutral-400 text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-600" /> Calculating Statistics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-white min-h-screen sm:min-h-0 sm:rounded-[36px] sm:border-2 sm:border-neutral-200/80 sm:shadow-xl p-6 space-y-6">
          
          {/* Header */}
          <header className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full text-neutral-800">
                <ArrowLeft className="h-6 w-6 stroke-[2.5]" />
              </Button>
            </Link>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              your metrics <TrendingUp className="h-5 w-5 text-neutral-700" />
            </h1>
          </header>

          {/* Total Lifetime Lending Card */}
          <Card className="bg-neutral-950 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(188,255,79,1)] overflow-hidden relative rounded-2xl">
            <CardContent className="p-6">
              <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                lifetime total lent
              </p>
              <div className="flex items-baseline justify-between">
                <span className="text-4xl font-black tracking-tight text-[#bcff4f]">
                  ₹{totalLent.toLocaleString("en-IN")}
                </span>
                <div className="text-3xl select-none absolute bottom-4 right-4 opacity-40 pointer-events-none">
                  📊
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metric Twin Pod Grid Layout */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#e4dcff] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
              <CardContent className="p-4 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-purple-700/70">Recovered Volume</p>
                <p className="text-xl font-black text-neutral-900">₹{totalRecovered.toLocaleString("en-IN")}</p>
                <div className="text-right text-lg pt-1">✌️</div>
              </CardContent>
            </Card>

            <Card className="bg-[#ffeb85] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
              <CardContent className="p-4 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-800/70">Payback Rate</p>
                <p className="text-xl font-black text-neutral-900">{successRate}%</p>
                <div className="text-right text-lg pt-1">🔥</div>
              </CardContent>
            </Card>
          </div>

          {/* Highest Current Delinquency Element Card row */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Biggest Target</h3>
            {biggestDebtor ? (
              <Card className="bg-[#ffdee6] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-black flex items-center justify-center text-xl shadow-sm">
                      {biggestDebtor.emoji}
                    </div>
                    <div>
                      <h4 className="font-black text-base text-neutral-950 flex items-center gap-1">
                        {biggestDebtor.name} <span className="text-sm">😈</span>
                      </h4>
                      <p className="text-xs font-bold text-rose-700/60">Highest overall balance accumulated</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-rose-600">₹{biggestDebtor.amount.toLocaleString("en-IN")}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-neutral-50 rounded-2xl p-6 border-2 border-dashed border-neutral-200 text-center text-xs font-bold text-neutral-400">
                <Award className="h-5 w-5 mx-auto mb-2 text-neutral-300" /> No current debtors found. Your friends are flawless! ✨
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}