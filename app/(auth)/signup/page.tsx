"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Building,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Password Strength Calculation
  const getPasswordStrength = () => {
    if (!password) return { label: "", score: 0, color: "" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: "Weak", score: 25, color: "bg-rose-500" };
    if (score === 2) return { label: "Fair", score: 50, color: "bg-amber-500" };
    if (score === 3) return { label: "Good", score: 75, color: "bg-emerald-400" };
    return { label: "Strong", score: 100, color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company: company || "My Company",
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      // Auto login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setSuccessMessage("Account created! Please sign in with your credentials.");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account.");
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl border border-border/80 shadow-2xl bg-card/70 backdrop-blur-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="text-xs text-muted-foreground">
          Start broadcasting multi-channel Email &amp; WhatsApp campaigns today.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2.5 animate-in fade-in duration-150">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-start gap-2.5 animate-in fade-in duration-150">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-foreground/90 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Shariar Nehal"
              className="w-full bg-background/80 border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-foreground/90 mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-background/80 border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Company / Workspace Name */}
        <div>
          <label className="block text-xs font-medium text-foreground/90 mb-1.5">
            Company / Workspace
          </label>
          <div className="relative">
            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Global Inc"
              className="w-full bg-background/80 border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-medium text-foreground/90 mb-1.5">
            Password (min. 6 characters)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create secure password"
              className="w-full bg-background/80 border border-border rounded-xl pl-10 pr-10 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Strength:</span>
                <span className="font-semibold text-foreground">{strength.label}</span>
              </div>
              <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Creating Workspace...</span>
            </>
          ) : (
            <>
              <span>Complete Registration</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="text-center text-xs text-muted-foreground pt-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground hover:text-primary transition-colors"
        >
          Sign in →
        </Link>
      </div>
    </div>
  );
}
