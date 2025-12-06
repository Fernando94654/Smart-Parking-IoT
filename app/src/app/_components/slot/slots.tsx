import { api } from "~/trpc/react";
import React from "react";
import type { ParkingSlot } from "@prisma/client";
import Slot from "./slot";

const Slots = ({ selectedParking }: { selectedParking: string }) => {
  const { data: slots, isLoading: loadingSlots } =
    api.parking.getParkingSlots.useQuery(selectedParking ?? "", {
      enabled: !!selectedParking,
      refetchInterval: 200,
    });

  const total = slots?.length ?? 0;
  const available = slots?.filter((s) => s.available).length ?? 0;

  return (
    <section className="h-full">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white lg:text-xl">
            Espacios de Estacionamiento
          </h2>
          <p className="text-muted text-sm lg:text-base">
            {total} espacios en total
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-sm lg:px-4 lg:py-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />
            <span className="font-medium text-green-400">
              {available} {available === 1 ? "disponible" : "disponibles"}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1.5 text-sm lg:px-4 lg:py-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />
            <span className="font-medium text-orange-400">
              {total - available}{" "}
              {total - available === 1 ? "ocupado" : "ocupados"}
            </span>
          </div>
        </div>
      </header>

      {loadingSlots ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 w-full animate-pulse rounded-xl bg-white/6 lg:h-36"
            />
          ))}
        </div>
      ) : !slots || slots.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/10">
          <p className="text-muted">No hay espacios para este parking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {slots.map((slot: ParkingSlot) => (
            <div key={slot.id} className="hover-glow w-full">
              <Slot slot={slot} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Slots;
