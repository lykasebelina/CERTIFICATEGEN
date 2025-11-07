import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Keep session synced when switching tabs or refocusing
  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    window.addEventListener("focus", syncSession);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") syncSession();
    });

    return () => {
      window.removeEventListener("focus", syncSession);
      window.removeEventListener("visibilitychange", syncSession);
    };
  }, []);

  // 🧩 Handle Supabase password recovery flow
  useEffect(() => {
    const handleRecovery = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (type === "recovery" && accessToken && refreshToken) {
        // Mark this tab as part of reset flow
        localStorage.setItem("isPasswordResetFlow", "true");

        // Establish temporary session
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // Redirect to password reset page
        window.location.replace("/reset-password");
      }
    };

    handleRecovery();
  }, []);

  // 🧠 Initialize and listen for session changes
  useEffect(() => {
    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Session error:", error);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      // 🧹 Clean up reset flow after successful password change
      if (session && localStorage.getItem("isPasswordResetFlow")) {
        localStorage.removeItem("isPasswordResetFlow");
      }

      // Notify other tabs to sync
      localStorage.setItem("auth-update", Date.now().toString());
    });

    // 📡 Sync session across tabs
    const handleStorageChange = async (event: StorageEvent) => {
      if (
        event.key?.endsWith("-auth-token") ||
        event.key === "auth-update"
      ) {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
