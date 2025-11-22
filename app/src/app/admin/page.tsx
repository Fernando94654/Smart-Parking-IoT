"use client";
import { useState } from "react";
import Stays from "../_components/slot/stays";

export default function AdminPage() {
    // TODO: Replace with actual parking selection logic
    const [selectedParking, setSelectedParking] = useState<string | null>("cmho397rl0000a4h08jnjzoam");
  return (
    <div className="p-6 w-full">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-sm text-muted">Visión general de usuarios y estadísticas del estacionamiento</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 card-dark rounded-xl p-4 hover-elevate hover-fade">
          <h2 className="text-lg font-semibold mb-3">Usuarios</h2>
          <p className="text-sm text-muted">Lista y métricas principales (mock)</p>
        </div>

        <aside className="space-y-4">
          <div className="card-dark rounded-xl p-4 hover-elevate hover-fade">
            <h3 className="text-lg font-semibold">Estadísticas</h3>
            <div className="mt-3 text-sm text-muted">Usuarios activos: <strong className="text-white ml-2">34</strong></div>
          </div>

          {selectedParking && (
            <div className="card-dark rounded-xl p-4 hover-elevate hover-fade">
              <h3 className="text-lg font-semibold">Estancias recientes</h3>
              <div className="mt-2">
                <Stays selectedParking={selectedParking} />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}