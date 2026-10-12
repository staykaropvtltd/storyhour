"use client";

import React, { useState } from "react";
import { useAdminCms } from "@/context/AdminCmsContext";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login } = useAdminCms();

  const [email, setEmail] = useState("admin@storyhour.co.uk");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    const result = await login(email, password);
    if (!result.success) {
      setLoginError(result.error || "Invalid credentials. Try again.");
    }
    setIsLoggingIn(false);
  };

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9281D] flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="font-serif text-2xl font-extrabold text-[#0F0F0F]">StoryHour Console</h1>
          <p className="text-sm text-[#696572] mt-1">Sign in to manage your content</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#E8E4DC] rounded-2xl shadow-sm p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@storyhour.co.uk"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-sm text-[#0F0F0F] placeholder-[#696572] focus:outline-none focus:border-[#C9281D] transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#0F0F0F] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter admin password"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl bg-[#FAF8F3] border border-[#E8E4DC] text-sm text-[#0F0F0F] placeholder-[#696572] focus:outline-none focus:border-[#C9281D] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#696572] hover:text-[#0F0F0F] transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {loginError && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                {loginError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#C9281D] hover:bg-[#B52218] text-white text-sm font-bold transition active:scale-[0.98] disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Sign in to CMS</span>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-[#696572] mt-6 font-mono">
            StoryHour Publishing Console 2.0
          </p>
        </div>
      </div>
    </div>
  );
}
