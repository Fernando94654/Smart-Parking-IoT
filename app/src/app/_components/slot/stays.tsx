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

const Stays = ({ selectedParking, all }: { selectedParking: string, all: boolean }) => {
  const { data: stays, isLoading } = all ? api.parking.getParkingStays.useQuery(selectedParking ?? "", { enabled: !!selectedParking }) :
  api.user.getUserStays.useQuery()

  return (
    <section className="rounded-lg card-dark p-4 shadow">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-white">Estancias</h2>
        <div className="text-sm text-muted">{stays ? `${stays.length} registros` : "—"}</div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-white/6 rounded animate-pulse" />
          ))}
        </div>
      ) : !stays || stays.length === 0 ? (
        <div className="py-6 text-center text-muted">No hay stays para este parking.</div>
      ) : (
        <>
          <div className="hidden md:block overflow-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-muted">
                  <th className="py-2">Usuario</th>
                  <th className="py-2">Inicio</th>
                  <th className="py-2">Fin</th>
                  <th className="py-2">Duración</th>
                  <th className="py-2">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {stays.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 text-sm text-white">{s.userName}</td>
                        <td className="py-3 text-sm text-muted">{formatDate(s.startHour)}</td>
                        <td className="py-3 text-sm text-muted">{s.endHour ? formatDate(s.endHour) : "En curso"}</td>
                        <td className="py-3 text-sm text-muted">{formatDuration(s.startHour, s.endHour)}</td>
                        <td className="py-3 text-sm text-muted">{s.price != null ? `$${Number(s.price).toFixed(2)}` : '—'}</td>
                      </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-2">
            {stays.map((s) => {
              return (
                <div key={s.id} className="p-3 rounded card-dark border">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-white">Usuario</div>
                      <div className="text-xs text-muted">{s.userName}</div>
                    </div>
                    <div className="text-right">
                          <div className="text-xs text-muted">{s.endHour ? "Finalizado" : "En curso"}</div>
                          <div className="text-xs text-muted">{formatDuration(s.startHour, s.endHour)}</div>
                          <div className="text-xs text-muted">{s.price != null ? `$${Number(s.price).toFixed(2)}` : '—'}</div>
                    </div>
                  </div>
                      <div className="mt-2 text-xs text-muted">{formatDate(s.startHour)} — {s.endHour ? formatDate(s.endHour) : "—"} {s.price != null ? `· $${Number(s.price).toFixed(2)}` : ''}</div>
                </div>
              )})}
          </div>
        </>
      )}
    </section>
  )
}

export default Stays