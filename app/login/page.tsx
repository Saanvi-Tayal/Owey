"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (isSignUp) {
      // Handle registering a brand new user account
      const { error } = await supabase.auth.signUp({ email, password, options:{
        emailRedirectTo: "https://owey-mu.vercel.app/"
      } });
      if (error) {
        setErrorMsg(error.message);
      } else {
        alert("Account created! You can sign in now.");
        setIsSignUp(false);
      }
    } else {
      // Handle signing into an existing user account
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push("/"); // Send them directly to the main dashboard
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f3efff] text-neutral-900 font-sans antialiased flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Main Branding Logo Display */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-neutral-900 drop-shadow-[2px_2px_0px_rgba(188,255,79,1)]">
            owey.
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            Stop making friendships awkward.
          </p>
        </div>

        {/* Credentials Form Box Container */}
        <Card className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[24px] overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-black tracking-tight">
              {isSignUp ? "create an account ✨" : "welcome back 👋"}
            </h2>

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Input: Email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black tracking-wide text-neutral-400 uppercase block pl-0.5">
                  email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 border-2 border-neutral-200 focus:border-black focus:bg-white rounded-xl py-3 px-4 text-sm font-extrabold transition-all outline-none"
                />
              </div>

              {/* Input: Password field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black tracking-wide text-neutral-400 uppercase block pl-0.5">
                  password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 border-2 border-neutral-200 focus:border-black focus:bg-white rounded-xl py-3 px-4 text-sm font-extrabold transition-all outline-none"
                />
              </div>

              {/* Error messages callout container */}
              {errorMsg && (
                <p className="text-xs font-black text-rose-500 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                  ⚠️ {errorMsg}
                </p>
              )}

              {/* Submission CTA Action trigger Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#bcff4f] hover:bg-[#a6e63b] text-black font-black text-xs py-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none rounded-xl tracking-wider uppercase mt-2"
              >
                {loading ? "Processing..." : isSignUp ? "sign up" : "log in"}
              </Button>
            </form>

            <hr className="border-neutral-100 my-2" />

            {/* Alternating screen setup toggle link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-black text-neutral-400 hover:text-black transition-colors underline decoration-2 underline-offset-4"
              >
                {isSignUp ? "Already have an account? Log In" : "New to owey? Create an Account"}
              </button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}