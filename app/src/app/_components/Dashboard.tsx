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
    <div className="p-6 font-sans text-gray-800">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Parking Dashboard</h1>
          <p className="text-sm text-gray-500">
            Selecciona un parking para ver stays y slots
          </p>
        </div>
      </header>

      <section className="mb-6">
        {loadingParkings ? (
          <div className="text-gray-500">Loading parkings…</div>
        ) : !parkings || parkings.length === 0 ? (
          <div className="text-gray-500">No hay parkings disponibles.</div>
        ) : (
          <select
            value={selectedParking ?? ""}
            onChange={(e) => setSelectedParking(e.target.value || null)}
            className="min-w-[280px] rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
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

      <main className=" gap-6 md:grid-cols-2">

        {selectedParking && (
          <Slots selectedParking={selectedParking} />
        )}
      </main>

      <LineChartComponent
        title="Temperature History"
        xData={
          temperatureHistory.data?.map((entry) => entry.date.getTime()) ?? []
        }
        yData={
          temperatureHistory.data?.map((entry) => Number(entry.temperature)) ??
          []
        }
        xLabel="Time"
        yLabel="Temperature °C"
      />
    </div>
  );
}
