import { api } from "~/trpc/react";

const formatDate = (d?: string | Date) => {
  if (!d) return "-";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Small image preview that fetches a signed URL from the server
const ImagePreview = ({
  path,
  alt,
}: {
  path?: string | null;
  alt?: string;
}) => {
  const { data: url } = api.user.getImageUrl.useQuery(path ?? "", {
    enabled: Boolean(path),
  });

  if (!path || !url) return null;

  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-block">
      <p>{alt}</p>
      <img
        src={url}
        alt={alt ?? 'imagen'}
        loading="lazy"
        className="rounded-md object-cover border border-white/6 w-full h-36 sm:w-12 sm:h-12"
      />
    </a>
  );
};

const formatDuration = (start: string | Date, end?: string | Date | null) => {
  const s = start instanceof Date ? start : new Date(start);
  const e = end ? (end instanceof Date ? end : new Date(end)) : new Date();
  const diff = Math.max(0, e.getTime() - s.getTime());
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rmins = mins % 60;
  return rmins === 0 ? `${hrs} h` : `${hrs} h ${rmins} min`;
};

const Stays = ({
  selectedParking,
  all,
  admin,
}: {
  selectedParking: string;
  all: boolean;
  admin: boolean;
}) => {
  const { data: stays, isLoading } = all
    ? api.parking.getParkingStays.useQuery(selectedParking ?? "", {
        enabled: !!selectedParking,
        refetchInterval: 200,
      })
    : api.user.getUserStays.useQuery();

  return (
    <section className="card-dark rounded-lg p-4 shadow">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Estancias</h2>
        <div className="text-muted text-sm">
          {stays ? `${stays.length} registros` : "—"}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-white/6" />
          ))}
        </div>
      ) : !stays || stays.length === 0 ? (
        <div className="text-muted py-6 text-center">
          No hay stays para este parking.
        </div>
      ) : (
        <>
          <div className="hidden overflow-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                  <tr className="text-muted text-xs">
                    <th className="py-2">Usuario</th>
                    <th className="py-2">Inicio</th>
                    <th className="py-2">Fin</th>
                    <th className="py-2">Duración</th>
                    <th className="py-2">Precio</th>
                    {admin && <th className="py-2">Fotos</th>}
                  </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {stays.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-white/5">
                    <td className="py-3 text-sm text-white">{s.userName}</td>
                    <td className="text-muted py-3 text-sm">{formatDate(s.startHour)}</td>
                    <td className="text-muted py-3 text-sm">{s.endHour ? formatDate(s.endHour) : 'En curso'}</td>
                    <td className="text-muted py-3 text-sm">{formatDuration(s.startHour, s.endHour)}</td>
                    <td className="text-muted py-3 text-sm">{s.price != null ? `$${Number(s.price).toFixed(2)}` : '—'}</td>
                    {admin && (
                      <td className="py-3 text-sm text-white">
                        <div className="flex items-center gap-2">
                          <ImagePreview path={s.entryImageUrl ?? undefined} alt={`entrada-${s.id}`} />
                          <ImagePreview path={s.exitImageUrl ?? undefined} alt={`salida-${s.id}`} />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {stays.map((s) => {
              return (
                <div key={s.id} className="card-dark rounded border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Usuario
                      </div>
                      <div className="text-muted text-xs">{s.userName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted text-xs">
                        {s.endHour ? "Finalizado" : "En curso"}
                      </div>
                      <div className="text-muted text-xs">
                        {formatDuration(s.startHour, s.endHour)}
                      </div>
                      <div className="text-muted text-xs">
                        {s.price != null
                          ? `$${Number(s.price).toFixed(2)}`
                          : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="text-muted mt-2 text-xs">
                    {formatDate(s.startHour)} — {s.endHour ? formatDate(s.endHour) : '—'} {s.price != null ? `· $${Number(s.price).toFixed(2)}` : ''}
                  </div>
                  {admin && (
                    <div className="mt-3 flex gap-2">
                      <ImagePreview path={s.entryImageUrl ?? undefined} alt={`Entrada`} />
                      <ImagePreview path={s.exitImageUrl ?? undefined} alt={`Salida`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};

export default Stays;
