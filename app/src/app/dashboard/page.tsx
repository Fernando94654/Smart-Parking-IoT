"use client";

import React, { useState } from "react";
import type { Parking } from "@prisma/client";
import { api } from "~/trpc/react";
import LineChartComponent from "../_components/lineChart";
import Slots from "../_components/slot/slots";

export default function DashboardPage() {
  const { data: parkings, isLoading: loadingParkings } =
    api.parking.getAll.useQuery();

  const [selectedParking, setSelectedParking] = useState<string | null>(
    "cmho397rl0000a4h08jnjzoam",
  );

  const temperatureHistory = api.environment.getTemperatureHistory.useQuery(
    undefined,
    {
      refetchInterval: 500,
    },
  );
  const humidityHistory = api.environment.getHumidityHistory.useQuery(
    undefined,
    {
      refetchInterval: 500,
    },
  );

  const { data: slots } = api.parking.getParkingSlots.useQuery(
    selectedParking ?? "",
    {
      enabled: !!selectedParking,
      refetchInterval: 200,
    },
  );

  const available = slots?.filter((s) => s.available).length ?? 0;
  const latestTemp =
    temperatureHistory.data?.[temperatureHistory.data.length - 1]?.reading;
  const latestHum =
    humidityHistory.data?.[humidityHistory.data.length - 1]?.reading;

  return (
    <div className="min-h-screen w-full p-4 pb-24 md:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-6 lg:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
              Parking Dashboard
            </h1>
            <p className="text-muted text-sm lg:text-base">
              Monitoreo en tiempo real del estacionamiento
            </p>
          </div>

          {/* Stats cards - visible on all sizes */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="glass rounded-lg px-4 py-2 text-sm lg:px-5 lg:py-3 lg:text-base">
              <span className="text-muted">Disponibles:</span>
              <strong className="ml-2 text-white">{available}</strong>
            </div>
            <div className="glass rounded-lg px-4 py-2 text-sm lg:px-5 lg:py-3 lg:text-base">
              <span className="text-muted">Temp:</span>
              <strong className="ml-2 text-white">
                {latestTemp ? `${Number(latestTemp).toFixed(1)}°C` : "—"}
              </strong>
            </div>
            <div className="glass rounded-lg px-4 py-2 text-sm lg:px-5 lg:py-3 lg:text-base">
              <span className="text-muted">Humedad:</span>
              <strong className="ml-2 text-white">
                {latestHum ? `${Number(latestHum).toFixed(0)}%` : "—"}
              </strong>
            </div>
          </div>
        </div>
      </header>

      {/* Parking selector */}
      <section className="mb-6 lg:mb-8">
        {loadingParkings ? (
          <div className="text-muted">Cargando parkings…</div>
        ) : !parkings || parkings.length === 0 ? (
          <div className="text-muted">No hay parkings disponibles.</div>
        ) : (
          <select
            value={selectedParking ?? ""}
            onChange={(e) => setSelectedParking(e.target.value || null)}
            className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm shadow-sm backdrop-blur-sm transition-all hover:border-white/20 focus:ring-2 focus:ring-(--accent-1) focus:outline-none lg:text-base"
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

      {/* Main content - vertical stack for better visibility */}
      <main className="mx-auto max-w-6xl space-y-6 lg:space-y-8">
        {/* Slots section */}
        <section className="card-dark rounded-xl p-4 lg:p-6">
          {selectedParking && <Slots selectedParking={selectedParking} />}
        </section>

        {/* Environment section */}
        <section className="card-dark hover-elevate rounded-xl p-4 lg:p-6">
          <h3 className="mb-4 text-lg font-semibold lg:mb-6 lg:text-xl">
            Monitoreo Ambiental
          </h3>

          {/* Charts - stacked vertically for better visibility on all screens */}
          <div className="grid grid-cols-1 gap-6">
            <div className="min-h-[250px] lg:min-h-[200px]">
              <LineChartComponent
                title="Temperatura"
                xData={
                  temperatureHistory.data?.map((entry) =>
                    entry.date.getTime(),
                  ) ?? []
                }
                yData={
                  temperatureHistory.data?.map((entry) =>
                    Number(entry.reading),
                  ) ?? []
                }
                xLabel="Tiempo"
                yLabel="°C"
              />
            </div>
            <div className="min-h-[250px] lg:min-h-80">
              <LineChartComponent
                title="Humedad"
                xData={
                  humidityHistory.data?.map((entry) => entry.date.getTime()) ??
                  []
                }
                yData={
                  humidityHistory.data?.map((entry) => Number(entry.reading)) ??
                  []
                }
                xLabel="Tiempo"
                yLabel="%"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
