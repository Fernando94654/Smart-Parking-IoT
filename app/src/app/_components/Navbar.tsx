"use client"

import Link from "next/link"
import { useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession();
  return (
  <header className="w-full bg-linear-to-r from-sky-600 via-cyan-500 to-emerald-400 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-white/20">
              {/* Logo */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" />
              </svg>
            </div>
            <Link href="/" className="text-lg font-bold tracking-tight">
              SmartParking
            </Link>
            <span className="text-sm text-white/80 ml-2">IoT · Estacionamiento Inteligente</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/admin" className="text-sm font-medium hover:underline">
              Admin
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              User Dashboard
            </Link>
            {session ? (
              <p>{session.user.name}</p>
            ) : (
              <>
                <button onClick={() => signIn()} className="text-sm font-semibold bg-white text-sky-700 px-3 py-1 rounded-md shadow-sm hover:opacity-95">
                  Login
                </button>
              </>
            )}
          </nav>

          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none"
            >
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white/5 border-t border-white/10">
          <div className="px-4 pt-4 pb-4 space-y-1">
            <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10">
              Admin
            </Link>
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10">
              User Dashboard
            </Link>
            <button onClick={() => signIn()} className="text-sm font-semibold bg-white text-sky-700 px-3 py-1 rounded-md shadow-sm hover:opacity-95">
              Login
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
