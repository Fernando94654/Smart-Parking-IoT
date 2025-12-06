"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import ChangeUserPlate from "../_components/changeUserPlate";
import PaymentMethods from "../_components/paymentMethods";
import Stays from "../_components/slot/stays";

export default function UserPage() {
  const parkingId = "cmho397rl0000a4h08jnjzoam";
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirect to sign-in page; using next-auth signIn to preserve provider flow
      // fallback to router.replace if you prefer a direct route
      void signIn(undefined, { callbackUrl: "/admin" });
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="mx-auto w-full max-w-6xl p-6">
        <div className="text-muted">Comprobando sesión…</div>
      </main>
    );
  }

  // At this point, status is either 'authenticated' or we already redirected
  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
          Mi Perfil
        </h1>
        <p className="text-muted text-sm">
          Gestiona tus datos, placa y estancias
        </p>
      </header>

      <section className="space-y-6">
        <ChangeUserPlate />
        <div className="card-dark rounded-xl p-4">
          <h2 className="text-lg font-semibold">Mis estancias</h2>
          <div className="mt-3">
            <Stays selectedParking={parkingId} all={false} admin={false} />
          </div>
        </div>
        <PaymentMethods />
      </section>
    </main>
  );
}
