"use client";

import React, { useState } from "react";
import type { Parking } from "@prisma/client";
import { api } from "~/trpc/react";
import LineChartComponent from "./lineChart";
import Slots from "./slot/slots";
export default function Dashboard() {
  const { data: parkings, isLoading: loadingParkings } =
    api.parking.getAll.useQuery();

  const [selectedParking, setSelectedParking] = useState<string | null>("cmho397rl0000a4h08jnjzoam");

  const temperatureHistory = api.environment.getTemperatureHistory.useQuery();

  return (
    <div className="p-6 w-full pb-24">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Parking Dashboard</h1>
          <p className="text-sm text-muted">
            Selecciona un parking para ver estancias y lugares disponibles
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="px-3 py-2 rounded-md glass text-sm">Disponibles: <strong className="text-white ml-2">12</strong></div>
          <div className="px-3 py-2 rounded-md glass text-sm">Temperatura: <strong className="text-white ml-2">22°C</strong></div>
        </div>
      </header>

      <section className="mb-6">
        {loadingParkings ? (
          <div className="text-muted">Loading parkings…</div>
        ) : !parkings || parkings.length === 0 ? (
          <div className="text-muted">No hay parkings disponibles.</div>
        ) : (
          <select
            value={selectedParking ?? ""}
            onChange={(e) => setSelectedParking(e.target.value || null)}
            className="min-w-[280px] rounded-md border border-white/6 px-3 py-2 text-sm bg-transparent shadow-sm focus:ring-2 focus:ring-(--accent-1) focus:outline-none"
          >
            <option value="">-- Selecciona un parking --</option>
            {parkings.map((p: Parking) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.location}
              </option>
            ))}
          </select>
        )}
      </section>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 card-dark rounded-xl p-4">
          {selectedParking && <Slots selectedParking={selectedParking} />}
        </div>

        <aside className="space-y-4">
          <div className="card-dark rounded-xl p-4 hover-elevate hover-fade">
            <h3 className="text-lg font-semibold">Ambiente</h3>
            <div className="mt-3">
              <LineChartComponent
                title="Historial de Temperatura"
                xData={
                  temperatureHistory.data?.map((entry) => entry.date.getTime()) ?? []
                }
                yData={
                  temperatureHistory.data?.map((entry) => Number(entry.temperature)) ??
                  []
                }
                xLabel="Tiempo"
                yLabel="Temperatura °C"
              />
            </div>
          </div>

          {/* <div className="card-dark rounded-xl p-4 hover-elevate hover-fade">
            <h3 className="text-lg font-semibold">Resumen</h3>
            <div className="mt-3 text-sm text-muted">
              - Total plazas: <strong className="text-white ml-2">120</strong>
            </div>
          </div> */}
        </aside>
      </main>
    </div>
  );
}
