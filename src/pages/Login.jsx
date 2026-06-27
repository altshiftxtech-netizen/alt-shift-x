import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, ShieldCheck, Sparkles, Heart } from "lucide-react";
import Logo from "@/components/Logo";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const { isAuthenticated, authChecked } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [authChecked, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-[#0A0A0C]">
      {/* ── Left brand panel — Alt+Shift+X welcome (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-12 bg-gradient-to-br from-[#1a1130] via-[#0e0a1f] to-[#0A0A0C]">
        {/* soft glow accents for a warm, comforting feel */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[28rem] h-[28rem] rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10">
          <Logo className="h-11 w-auto" variant="purple" />
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Welcome home to <span className="bg-gradient-to-r from-violet-300 to-amber-200 bg-clip-text text-transparent">Alt+Shift+X</span>
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            The intelligence marketplace where builders ship, buyers deploy, and every component earns its trust. Good to see you back.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-slate-300">
              <span className="p-1.5 rounded-lg bg-white/5"><ShieldCheck className="w-4 h-4 text-violet-300" /></span>
              <span className="text-sm">Bank-grade security on every login</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <span className="p-1.5 rounded-lg bg-white/5"><Sparkles className="w-4 h-4 text-amber-300" /></span>
              <span className="text-sm">Your components, revenue & insights in one place</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <span className="p-1.5 rounded-lg bg-white/5"><Heart className="w-4 h-4 text-rose-300" /></span>
              <span className="text-sm">Built by a community that has your back</span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">© {new Date().getFullYear()} Alt+Shift+X. All rights reserved.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile brand header (left panel is hidden on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex"><Logo className="h-10 w-auto" variant="white" /></div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Log in to your Alt+Shift+X account</p>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <Button
              variant="outline"
              className="w-full h-12 text-sm font-medium mb-6"
              onClick={handleGoogle}
            >
              <GoogleIcon className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">or</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}