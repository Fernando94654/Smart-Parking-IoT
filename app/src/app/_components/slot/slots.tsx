import { api } from "~/trpc/react";
import React from "react";
import type { ParkingSlot } from "@prisma/client";
import Slot from "./slot";
const Slots = ({ selectedParking }: { selectedParking: string }) => {
  const { data: slots, isLoading: loadingSlots } =
    api.parking.getParkingSlots.useQuery(selectedParking ?? "", {
      enabled: !!selectedParking,
    });

  const total = slots?.length ?? 0
  const available = slots?.filter((s) => s.available).length ?? 0

  return (
    <section className="rounded-lg card-dark p-4 shadow hover-elevate hover-fade">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Slots</h2>
          <p className="text-sm text-muted">Estacionamiento — {total} en total</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/6 text-white text-sm">
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-1)' }} />
            {available} disponibles
          </div>
          <div className="text-sm text-muted">{total - available} ocupados</div>
        </div>
      </header>

      {loadingSlots ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-full h-28 rounded-lg bg-white/6 animate-pulse" />
          ))}
        </div>
      ) : !slots || slots.length === 0 ? (
        <div className="text-muted">No hay slots para este parking.</div>
      ) : (
        <div className="grid gap-4 grid-cols-2">
          {slots.map((slot: ParkingSlot) => (
            <div key={slot.id} className="hover-glow">
              <Slot slot={slot} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Slots;