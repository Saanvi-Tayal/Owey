// components/AuthListener.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Make sure this path points to your supabase client

export default function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    // This listens for ANY authentication state change (like clicking an email link)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      
      if (event === "SIGNED_IN" && session) {
        // The user successfully verified their email! 
        // Redirect them to the main app (e.g., dashboard or home)
        router.push("/"); 
        
        // Optional: Force a hard refresh to clear the ugly URL hash
        // window.location.href = "/"; 
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return null; // This component is invisible
}