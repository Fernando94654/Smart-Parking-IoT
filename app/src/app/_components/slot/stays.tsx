import { api } from "~/trpc/react"

const formatDate = (d?: string | Date) => {
  if (!d) return "-"
  const date = d instanceof Date ? d : new Date(d)
  return date.toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

const formatDuration = (start: string | Date, end?: string | Date | null) => {
  const s = start instanceof Date ? start : new Date(start)
  const e = end ? (end instanceof Date ? end : new Date(end)) : new Date()
  const diff = Math.max(0, e.getTime() - s.getTime())
  const mins = Math.round(diff / 60000)
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const rmins = mins % 60
  return rmins === 0 ? `${hrs} h` : `${hrs} h ${rmins} min`
}

const Stays = ({ selectedParking }: { selectedParking: string }) => {
  const { data: stays, isLoading } = api.parking.getParkingStays.useQuery(selectedParking ?? "", { enabled: !!selectedParking })

  return (
    <section className="rounded-lg bg-white p-4 shadow">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Stays</h2>
        <div className="text-sm text-gray-600">{stays ? `${stays.length} registros` : "—"}</div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : !stays || stays.length === 0 ? (
        <div className="py-6 text-center text-gray-600">No hay stays para este parking.</div>
      ) : (
        <>
          <div className="hidden md:block">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="py-2">Usuario</th>
                  <th className="py-2">Inicio</th>
                  <th className="py-2">Fin</th>
                  <th className="py-2">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stays.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 text-sm text-gray-800">{s.userName}</td>
                    <td className="py-3 text-sm text-gray-700">{formatDate(s.startHour)}</td>
                    <td className="py-3 text-sm text-gray-700">{s.endHour ? formatDate(s.endHour) : "En curso"}</td>
                    <td className="py-3 text-sm text-gray-700">{formatDuration(s.startHour, s.endHour)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-2">
            {stays.map((s) => {
              return (
                <div key={s.id} className="p-3 rounded bg-gray-50 border">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-800">Usuario</div>
                      <div className="text-xs text-gray-600">{s.userName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">{s.endHour ? "Finalizado" : "En curso"}</div>
                    <div className="text-xs text-gray-500">{formatDuration(s.startHour, s.endHour)}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">{formatDate(s.startHour)} — {s.endHour ? formatDate(s.endHour) : "—"}</div>
              </div>
            )})}
          </div>
        </>
      )}
    </section>
  )
}

export default Stays