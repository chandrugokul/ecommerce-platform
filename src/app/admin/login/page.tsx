"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      router.replace("/admin");
      return;
    }

    setChecking(false);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        console.error("LOGIN ERROR:", loginError);
        setError(loginError.message);
        return;
      }

      if (!data.user) {
        setError("Login failed. Please try again.");
        return;
      }

      /*
       * Verify that this authenticated user is connected
       * to a client in client_users.
       */
      const { data: clientUser, error: clientError } =
        await supabase
          .from("client_users")
          .select("id, client_id, role, status")
          .eq("user_id", data.user.id)
          .eq("status", "active")
          .maybeSingle();

      if (clientError) {
        console.error("CLIENT USER ERROR:", clientError);

        await supabase.auth.signOut();

        setError("Unable to verify your client account.");
        return;
      }

      if (!clientUser) {
        await supabase.auth.signOut();

        setError(
          "Your account is not connected to an active client."
        );
        return;
      }

      router.replace("/admin");
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf7]">
        <div className="text-sm text-gray-600">
          Checking login...
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-lg sm:p-8">

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to manage your store
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Authorized client users only
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}