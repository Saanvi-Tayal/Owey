"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, SlidersHorizontal, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface ActivityItem {
  id: string;
  item: string;
  amount: number;
  is_paid: boolean;
  created_at: string;
  debtors: {
    name: string;
  } | null;
}

export default function ActivityPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Fetch debts and join with debtor name metadata
      const { data, error } = await supabase
        .from("debts")
        .select(`
          id,
          item,
          amount,
          is_paid,
          created_at,
          debtors ( name )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActivities((data as any) || []);
    } catch (err) {
      console.error("Failed to load activity stream:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [router]);

  // Dynamic clear handler to mutate state live on the cloud
  const handleMarkAsPaid = async (debtId: string) => {
    setActionLoading(debtId);
    try {
      const { error } = await supabase
        .from("debts")
        .update({ is_paid: true })
        .eq("id", debtId);

      if (error) throw error;

      // Optimistically update local array state immediately
      setActivities(prev =>
        prev.map(act => (act.id === debtId ? { ...act, is_paid: true } : act))
      );
      
      router.refresh();
    } catch (err) {
      console.error("Failed to clear debt transaction record:", err);
      alert("Could not settle this transaction row.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredActivities = activities.filter(act => {
    if (filter === "all") return true;
    if (filter === "lent") return !act.is_paid;
    if (filter === "paid") return act.is_paid;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-black text-neutral-400 text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-600" /> Loading Live Feed...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-white min-h-screen sm:min-h-0 sm:rounded-[36px] sm:border-2 sm:border-neutral-200/80 sm:shadow-xl p-6 space-y-6">
          
          {/* Header */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full text-neutral-800">
                  <ArrowLeft className="h-6 w-6 stroke-[2.5]" />
                </Button>
              </Link>
              <h1 className="text-xl font-black tracking-tight">activity log</h1>
            </div>
            <Button variant="outline" size="icon" className="rounded-xl border-neutral-200">
              <SlidersHorizontal className="h-4 w-4 text-neutral-600" />
            </Button>
          </header>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["all", "lent", "paid"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 shrink-0 ${
                  filter === type
                    ? "bg-neutral-950 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-neutral-50 text-neutral-400 border-neutral-200/60 hover:border-neutral-300"
                }`}
              >
                {type === "lent" ? "unpaid" : type}
              </button>
            ))}
          </div>

          {/* Feed Content */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Recent Ledger</h3>
            
            {filteredActivities.length === 0 ? (
              <p className="text-center text-xs font-bold text-neutral-400 py-12">No transactions matching this filter. Empty horizons! ✨</p>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((act) => (
                  <Card key={act.id} className={`border-2 transition-all shadow-sm group ${act.is_paid ? 'border-neutral-100 bg-neutral-50/50' : 'border-neutral-200 hover:border-black'}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base ${act.is_paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {act.is_paid ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-neutral-900">
                            {act.debtors?.name || "Someone"}{" "}
                            <span className={`font-medium text-xs ${act.is_paid ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md" : "text-neutral-500"}`}>
                              {act.is_paid ? "settled up" : `borrowed for "${act.item}"`}
                            </span>
                          </p>
                          <p className="text-[11px] font-semibold text-neutral-400">
                            {new Date(act.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`font-black text-base ${act.is_paid ? "text-neutral-400 line-through opacity-60" : "text-neutral-900"}`}>
                          ₹{act.amount}
                        </span>
                        {!act.is_paid && (
                          <Button
                            size="sm"
                            disabled={actionLoading === act.id}
                            onClick={() => handleMarkAsPaid(act.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-wide rounded-lg px-3 py-1.5 h-auto border border-emerald-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                          >
                            {actionLoading === act.id ? "..." : "Clear"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}