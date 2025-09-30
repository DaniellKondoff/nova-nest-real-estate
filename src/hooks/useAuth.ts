"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";
import { getAdminRole, isAdminUser, signInWithEmail, signOut } from "@/lib/auth";

export type UseAuthState = {
  user: User | null;
  isAdmin: boolean;
  adminRole: "admin" | "agent" | "manager" | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
};

export function useAuth(): UseAuthState {
  const supabase = useMemo(() => getBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<"admin" | "agent" | "manager" | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        if (!isMounted) return;
        setUser(data.user ?? null);
        if (data.user) {
          const [admin, role] = await Promise.all([isAdminUser(), getAdminRole()]);
          if (!isMounted) return;
          setIsAdmin(admin);
          setAdminRole(role);
        } else {
          setIsAdmin(false);
          setAdminRole(null);
        }
      } catch (error) {
        console.error("useAuth: Bootstrap error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // Initial load
    bootstrap();

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        Promise.all([isAdminUser(), getAdminRole()]).then(([admin, role]) => {
          setIsAdmin(admin);
          setAdminRole(role);
        });
      } else {
        setIsAdmin(false);
        setAdminRole(null);
      }
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignIn = async (email: string, password: string) => {
    setError(null);
    const result = await signInWithEmail(email, password);
    if (!result.success) {
      setError(result.error);
      return false;
    }
    return true;
  };

  const handleSignOut = async () => {
    setError(null);
    const result = await signOut();
    if (!result.success) {
      setError(result.error ?? "Възникна грешка при излизане.");
      return false;
    }
    return true;
  };

  return {
    user,
    isAdmin,
    adminRole,
    loading,
    error,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}


