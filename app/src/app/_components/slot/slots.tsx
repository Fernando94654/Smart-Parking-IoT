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
    <section className="rounded-lg bg-white p-4 shadow">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Slots</h2>
          <p className="text-sm text-gray-500">Estacionamiento — {total} en total</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-800 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ background: '#16a34a' }} />
            {available} disponibles
          </div>
          <div className="text-sm text-gray-500">{total - available} ocupados</div>
        </div>
      </header>

      {loadingSlots ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-full h-28 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : !slots || slots.length === 0 ? (
        <div className="text-gray-500">No hay slots para este parking.</div>
      ) : (
        <div className="grid gap-4j grid-cols-2">
          {slots.map((slot: ParkingSlot) => (
            <Slot key={slot.id} slot={slot} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Slots;