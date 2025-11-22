"use client"

import ChangeUserPlate from "../_components/changeUserPlate";
import Stays from "../_components/slot/stays";

export default function UserPage() {
  const parkingId = "cmho397rl0000a4h08jnjzoam";
  return (
    <main className="p-6 w-full">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
        <p className="text-sm text-muted">Gestiona tus datos, placa y estancias</p>
      </header>

      <section className="space-y-6">
        <ChangeUserPlate />

        <div className="card-dark rounded-xl p-4">
          <h2 className="text-lg font-semibold">Mis estancias</h2>
          <div className="mt-3">
            <Stays selectedParking={parkingId} />
          </div>
        </div>
      </section>
    </main>
  );
}
