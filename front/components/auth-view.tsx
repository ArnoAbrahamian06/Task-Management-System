"use client"

import { useMemo, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"

interface AuthViewProps {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (name: string, email: string, password: string) => Promise<void>
}

export function AuthView({ onLogin, onRegister }: AuthViewProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const title = mode === "login" ? "Sign in to TaskFlow" : "Create a TaskFlow account"
  const actionLabel = mode === "login" ? "Sign in" : "Register"
  const switchLabel = mode === "login" ? "Create an account" : "Already have an account"

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "login") {
        await onLogin(email.trim(), password)
      } else {
        await onRegister(name.trim(), email.trim(), password)
      }
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : "Authentication failed. Please check your credentials and try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = useMemo(() => {
    if (mode === "login") {
      return email.trim().length > 0 && password.length > 0
    }

    return name.trim().length > 0 && email.trim().length > 0 && password.length >= 6
  }, [mode, name, email, password])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-2xl shadow-black/20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {mode === "login"
              ? "Enter your credentials to access TaskFlow."
              : "Register a new account and start managing your team tasks."}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label className="block text-sm font-medium text-slate-300">
              Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Your full name"
              />
            </label>
          )}

          <label className="block text-sm font-medium text-slate-300">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your password"
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={!canSubmit || loading} className="w-full">
            {loading ? "Please wait…" : actionLabel}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login")
              setError("")
            }}
            className="font-medium text-slate-100 hover:text-white"
          >
            {switchLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
