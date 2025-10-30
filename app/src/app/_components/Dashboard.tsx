"use client";

import React, { useState } from "react";
import type { Parking, Stay, ParkingSlot } from "@prisma/client";
import { api } from "~/trpc/react";

export default function Dashboard() {
	const { data: parkings, isLoading: loadingParkings } = api.parking.getAll.useQuery();

	const [selectedParking, setSelectedParking] = useState<string | null>(null);

	const { data: stays, isLoading: loadingStays } = api.parking.getParkingStays.useQuery(selectedParking ?? "", {
		enabled: !!selectedParking,
	});

	const { data: slots, isLoading: loadingSlots } = api.parking.getParkingSlots.useQuery(selectedParking ?? "", {
		enabled: !!selectedParking,
	});

	return (
		<div className="p-6 font-sans text-gray-800">
			<header className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Parking Dashboard</h1>
					<p className="text-sm text-gray-500">Selecciona un parking para ver stays y slots</p>
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
						className="min-w-[280px] rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
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

			<main className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div className="rounded-lg bg-white p-4 shadow">
					<h2 className="mb-3 text-lg font-medium">Stays</h2>

					{loadingStays ? (
						<div className="text-gray-500">Cargando stays…</div>
					) : !stays || stays.length === 0 ? (
						<div className="text-gray-500">No hay stays para este parking.</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full table-fixed text-sm">
								<thead>
									<tr className="text-left text-xs text-gray-500">
										<th className="pb-2">Plate</th>
										<th className="pb-2">Start</th>
										<th className="pb-2">End</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{stays.map((s: Stay) => (
										<tr key={s.id} className="align-top">
											<td className="py-2">{s.plateNumber}</td>
											<td className="py-2">{new Date(s.startHour).toLocaleString()}</td>
											<td className="py-2">{s.endHour ? new Date(s.endHour).toLocaleString() : "-"}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				<div className="rounded-lg bg-white p-4 shadow">
					<h2 className="mb-3 text-lg font-medium">Slots</h2>

					{loadingSlots ? (
						<div className="text-gray-500">Cargando slots…</div>
					) : !slots || slots.length === 0 ? (
						<div className="text-gray-500">No hay slots para este parking.</div>
					) : (
						<div className="flex flex-wrap gap-3">
							{slots.map((slot: ParkingSlot) => (
								<div
									key={slot.id}
									className={`min-w-[140px] rounded-md border p-3 ${
										slot.available ? "border-green-100 bg-green-50" : "border-red-100 bg-red-50"
									}`}
								>
									<div className="font-semibold">#{slot.ultrasonicId}</div>
									<div className={`${slot.available ? "text-green-600" : "text-red-600"}`}>{slot.available ? "Disponible" : "Ocupado"}</div>
								</div>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
