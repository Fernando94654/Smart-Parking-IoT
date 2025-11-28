"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "~/trpc/react";

export default function Navbar() {
  const { data: session } = useSession();
  const { data: role } = api.user.getMyRole.useQuery(undefined, {
    enabled: !!session,
  });

  return (
    <>
      <header className="fixed top-0 left-0 z-30 hidden w-full md:block">
        <div className="glass px-4 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="neon-gradient flex h-10 w-10 items-center justify-center rounded-md shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="h-6 w-6"
                >
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" />
                </svg>
              </div>
              <Link href="/" className="text-lg font-bold tracking-tight">
                <span className="neon-gradient bg-clip-text text-transparent">
                  SmartParking
                </span>
              </Link>
              <span className="text-muted hidden text-sm sm:inline">
                Smart Parking
              </span>
            </div>

            <nav className="hidden items-center gap-4 md:flex">
              <Link
                href="/dashboard"
                className="rounded-md px-2 py-1 text-sm font-medium transition-colors duration-150 hover:bg-white/5"
              >
                Inicio
              </Link>
              {role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-md px-2 py-1 text-sm font-medium transition-colors duration-150 hover:bg-white/5"
                >
                  Administración
                </Link>
              )}

              {/* Session actions - mirror mobile behavior */}
              {session ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/user"
                    className="rounded-md px-2 py-1 text-sm font-medium transition-colors duration-150 hover:bg-white/5"
                  >
                    Perfil
                  </Link>
                  <Link
                    href="/settings"
                    className="rounded-md px-2 py-1 text-sm font-medium transition-colors duration-150 hover:bg-white/5"
                  >
                    Config
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="rounded-md bg-white/5 px-3 py-1 text-sm font-semibold text-white/90 transition-colors duration-150 hover:bg-white/10"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="neon-gradient rounded-md px-3 py-1 text-sm font-semibold text-white shadow transition-transform duration-150 hover:scale-[1.02]"
                >
                  Iniciar sesión
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile top bar showing app name (full-width) */}
      <header className="fixed top-0 left-0 z-40 w-full md:hidden">
        <div className="glass px-3 backdrop-blur-sm">
          <div className="mx-auto flex h-12 max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="neon-gradient flex h-8 w-8 items-center justify-center rounded-md shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="h-4 w-4"
                >
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" />
                </svg>
              </div>
              <Link href="/" className="text-sm font-semibold tracking-tight">
                <span className="text-white">Smart Parking</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom mobile nav with icons */}
      <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 transform md:hidden">
        <div
          className="flex items-center gap-2 rounded-full px-3 py-2 shadow-lg"
          style={{ background: "var(--panel)" }}
        >
          <Link
            href="/dashboard"
            className="group flex flex-col items-center rounded-md px-3 text-xs text-gray-200 transition-colors duration-150 hover:bg-white/6 hover:text-white"
          >
            <svg
              className="mb-1 h-6 w-6 text-gray-100 group-hover:text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M3 13h8V3H3v10zM13 21h8V11h-8v10z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Inicio</span>
          </Link>

          <Link
            href="/user"
            className="group flex flex-col items-center rounded-md px-3 text-xs text-gray-200 transition-colors duration-150 hover:bg-white/6 hover:text-white"
          >
            <svg
              className="mb-1 h-6 w-6 group-hover:text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 22c0-3.866 3.582-7 8-7s8 3.134 8 7"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Usuario</span>
          </Link>

          <Link
            href="/settings"
            className="group flex flex-col items-center rounded-md px-3 text-xs text-gray-200 transition-colors duration-150 hover:bg-white/6 hover:text-white"
          >
            <svg
              className="mb-1 h-6 w-6 group-hover:text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06A2 2 0 012.3 17.4l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09c.67 0 1.26-.4 1.51-1a1.65 1.65 0 00-.33-1.82L4.3 4.3a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H11a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09c.67 0 1.26.4 1.51 1a1.65 1.65 0 001.82.33l.06-.06A2 2 0 0121.7 6.6l-.06.06a1.65 1.65 0 00-.33 1.82V11c0 .67.4 1.26 1 1.51z"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Configuraciones</span>
          </Link>

          {role === "ADMIN" && (
            <Link
              href="/admin"
              className="group flex flex-col items-center rounded-md px-3 text-xs text-gray-200 transition-colors duration-150 hover:bg-white/6 hover:text-white"
            >
              <svg
                className="mb-1 h-6 w-6 group-hover:text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M3 12h18M3 6h18M3 18h18"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Admin</span>
            </Link>
          )}

          {/* Login / Profile action in mobile nav */}
          {!session ? (
            <button
              onClick={() => signIn()}
              aria-label="Iniciar sesión"
              className="group flex flex-col items-center rounded-md px-3 text-xs text-gray-200 transition-colors duration-150 hover:bg-white/6 hover:text-white"
            >
              <svg
                className="mb-1 h-6 w-6 group-hover:text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 17l5-5-5-5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Iniciar sesión</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => signOut()}
                aria-label="Cerrar sesión"
                className="group flex flex-col items-center rounded-md px-3 text-xs text-gray-200 transition-colors duration-150 hover:bg-white/6 hover:text-white"
              >
                <svg
                  className="mb-1 h-6 w-6 group-hover:text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 17l5-5-5-5"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Salir</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
