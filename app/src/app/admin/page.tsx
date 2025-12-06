"use client";
import { useState } from "react";
import Stays from "../_components/slot/stays";
import { useSession, signIn } from "next-auth/react";
import { api } from "~/trpc/react";

export default function AdminPage() {
  const [selectedParking, setSelectedParking] = useState<string | null>(
    "cmho397rl0000a4h08jnjzoam",
  );
  const { data: session, status } = useSession();
  const { data: role, isLoading: roleLoading } = api.user.getMyRole.useQuery(
    undefined,
    { enabled: status === "authenticated" },
  );
  const totalUsers = api.user.getTotalUsers.useQuery();
  const { data: slots } = api.parking.getParkingSlots.useQuery(
    selectedParking ?? "",
    {
      enabled: !!selectedParking,
      refetchInterval: 200,
    },
  );
  const { data: stays } = api.parking.getParkingStays.useQuery(
    selectedParking ?? "",
    {
      enabled: !!selectedParking,
      refetchInterval: 200,
    },
  );

  const totalSlots = slots?.length ?? 0;
  const availableSlots = slots?.filter((s) => s.available).length ?? 0;
  const occupiedSlots = totalSlots - availableSlots;
  const activeStays = stays?.filter((s) => !s.endHour).length ?? 0;

  if (status === "loading" || roleLoading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
          <div className="text-muted">Comprobando permisos…</div>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    void signIn(undefined, { callbackUrl: "/admin" });
    return (
      <main className="flex min-h-screen w-full items-center justify-center p-6">
        <div className="text-muted">Redirigiendo al inicio de sesión…</div>
      </main>
    );
  }

  if (role !== "ADMIN") {
    return (
      <main className="flex min-h-screen w-full items-center justify-center p-6">
        <div className="card-dark max-w-md rounded-xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-white">Acceso denegado</h1>
          <p className="text-muted text-sm">
            Necesitas permisos de administrador para ver esta página.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full p-6 lg:p-10">
      <header className="mb-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
                Panel de Administración
              </h1>
              <div className="mt-2 text-sm text-white/60">
                Visión general de usuarios y estadísticas del estacionamiento
              </div>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-full bg-linear-to-tr from-white/6 to-white/3 p-2 shadow-sm">
                <svg
                  className="h-6 w-6 text-white/80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 10h18M7 15h1m4 0h1"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="mt-4 h-0.5 w-full animate-[pulse_2.5s_infinite] rounded-full bg-linear-to-r from-[#00FFA3]/10 via-[#7C4DFF]/8 to-[#00B4FF]/6 opacity-80" />
        </div>
      </header>

      <section className="mx-auto mb-8 max-w-6xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/** stat card template **/}
          <div className="relative transform overflow-hidden rounded-2xl border border-white/6 bg-linear-to-tr from-white/3 to-white/6 p-4 shadow-lg backdrop-blur-md transition hover:scale-[1.02]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/6">
                <svg
                  className="h-5 w-5 text-orange-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="4" fill="currentColor" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs text-white/60">Usuarios</div>
                <div className="mt-1 animate-[fadeIn_450ms_ease] text-2xl font-extrabold text-white">
                  {totalUsers.data ?? "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="relative transform overflow-hidden rounded-2xl border border-white/6 bg-linear-to-tr from-white/3 to-white/6 p-4 shadow-lg backdrop-blur-md transition hover:scale-[1.02]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/6">
                <svg
                  className="h-6 w-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="3"
                    strokeWidth="1.8"
                  />
                  <path
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 7h3.5a3 3 0 0 1 0 6H10V7z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs text-white/60">Espacios</div>
                <div className="mt-1 text-2xl font-extrabold text-white">
                  {totalSlots}
                </div>
              </div>
            </div>
          </div>

          <div className="relative transform overflow-hidden rounded-2xl border border-white/6 bg-linear-to-tr from-white/3 to-white/6 p-4 shadow-lg backdrop-blur-md transition hover:scale-[1.02]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/6">
                <svg
                  className="h-6 w-6 text-green-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="3"
                    strokeWidth="1.8"
                  />
                  <path
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h8"
                  />
                  <path
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v8"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs text-white/60">Disponibles</div>
                <div className="mt-1 text-2xl font-extrabold text-emerald-300">
                  {availableSlots}
                </div>
              </div>
            </div>
          </div>

          <div className="relative transform overflow-hidden rounded-2xl border border-white/6 bg-linear-to-tr from-white/3 to-white/6 p-4 shadow-lg backdrop-blur-md transition hover:scale-[1.02]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/6">
                <svg
                  className="h-6 w-6 text-red-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="3"
                    strokeWidth="1.8"
                  />
                  <path
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 8l8 8"
                  />
                  <path
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 8l-8 8"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs text-white/60">Ocupados</div>
                <div className="mt-1 text-2xl font-extrabold text-orange-300">
                  {occupiedSlots}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl">
        <div className="card-dark animate-[fadeInUp_500ms_ease] rounded-2xl border border-white/6 p-4 shadow-xl lg:p-6">
          {selectedParking && (
            <Stays selectedParking={selectedParking} all={true} admin={true} />
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from{opacity:0; transform: translateY(6px)} to{opacity:1; transform:none} }
        @keyframes fadeInUp { from{opacity:0; transform: translateY(10px)} to{opacity:1; transform:none} }
        .animate-[fadeIn_450ms_ease]{ animation: fadeIn 450ms ease both }
        .animate-[fadeInUp_500ms_ease]{ animation: fadeInUp 500ms ease both }
        .animate-[pulse_2.5s_infinite]{ animation: pulse 2.5s infinite }
      `}</style>
    </div>
  );
}
