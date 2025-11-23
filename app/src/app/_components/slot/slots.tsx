import { api } from "~/trpc/react";
import React from "react";
import type { ParkingSlot } from "@prisma/client";
import Slot from "./slot";
const Slots = ({ selectedParking }: { selectedParking: string }) => {
  const { data: slots, isLoading: loadingSlots } =
    api.parking.getParkingSlots.useQuery(selectedParking ?? "", {
      enabled: !!selectedParking,
    });

  const total = slots?.length ?? 0;
  const available = slots?.filter((s) => s.available).length ?? 0;

  return (
    <section className="card-dark hover-elevate hover-fade rounded-lg p-4 shadow">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Slots</h2>
          <p className="text-muted text-sm">
            Estacionamiento — {total} en total
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex min-w-0 items-center gap-2 rounded-full bg-white/6 px-3 py-1 text-sm text-white">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: "var(--accent-1)" }}
            />
            <span className="truncate">{available} {available === 1 ? "disponible" : "disponibles"}</span>
          </div>
          <div className="text-muted text-sm min-w-0 truncate">{total - available} {total - available === 1 ? "ocupado" : "ocupados"}</div>
        </div>
      </header>

      {loadingSlots ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 w-full animate-pulse rounded-lg bg-white/6"
            />
          ))}
        </div>
      ) : !slots || slots.length === 0 ? (
        <div className="text-muted">No hay slots para este parking.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
