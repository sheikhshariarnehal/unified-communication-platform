"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
  useMemo,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface UserWorkspace {
  id: string;
  name: string;
  slug: string;
  business_type?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  workspace: UserWorkspace | null;
  role: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  workspace: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [workspace, setWorkspace] = useState<UserWorkspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const supabase = useMemo(() => createClient(), []);

  const refreshUser = async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentUser) {
        // Query user's assigned workspace
        const { data: member } = await supabase
          .from("workspace_members")
          .select("workspace_id, role, workspace:workspaces(*)")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (member && member.workspace) {
          setWorkspace(member.workspace as any);
          setRole(member.role);
        } else {
          // If no workspace record exists, fallback to default
          setWorkspace({
            id: "a0000000-0000-0000-0000-000000000001",
            name: "Acme Global Corp",
            slug: "acme-global",
          });
          setRole("owner");
        }
      } else {
        setWorkspace(null);
        setRole(null);
      }
    } catch (err) {
      console.error("[AuthProvider refresh error]:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (!newSession?.user) {
        setWorkspace(null);
        setRole(null);
      }
      setIsLoading(false);
      startTransition(() => {
        router.refresh();
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setWorkspace(null);
    setRole(null);
    setIsLoading(false);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        workspace,
        role,
        isLoading,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
