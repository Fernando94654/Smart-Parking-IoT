import React from "react";
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

const ImagePreview = ({
  path,
  alt,
  size = "md",
  showCaption = false,
}: {
  path?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
  showCaption?: boolean;
}) => {
  const { data: url } = api.user.getImageUrl.useQuery(path ?? "", {
    enabled: Boolean(path),
  });

  if (!path || !url) return null;

  // select classes based on requested size
  const sizeClass =
    size === "lg"
      ? "h-30 w-30 lg:h-28 lg:w-28"
      : size === "sm"
        ? "h-10 w-10 lg:h-12 lg:w-12"
        : "h-16 w-16 lg:h-20 lg:w-20";

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group inline-block"
    >
      <div className="relative overflow-hidden rounded-lg border border-white/10 transition-all duration-200 group-hover:border-white/20 group-hover:shadow-lg">
        <img
          src={url}
          alt={alt ?? "imagen"}
          loading="lazy"
          className={`${sizeClass} object-cover transition-transform duration-200 group-hover:scale-110`}
        />
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
      </div>
      {showCaption && (
        <p className="mt-1 text-center text-[11px] font-medium text-white/70">
          {alt}
        </p>
      )}
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
    : api.user.getUserStays.useQuery(undefined, {
        refetchInterval: 200,
      });

  const activeStays = stays?.filter((s) => !s.endHour).length ?? 0;

  return (
    <section className="h-full">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white lg:text-xl">
            Historial de Estancias
          </h2>
          <p className="text-muted text-sm lg:text-base">
            {stays ? `${stays.length} registros` : "Cargando..."}
          </p>
        </div>
        {activeStays > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-sm lg:px-4 lg:py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            </span>
            <span className="font-medium text-blue-400">
              {activeStays} en curso
            </span>
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-white/6 lg:h-16"
            />
          ))}
        </div>
      ) : !stays || stays.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/10">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-white/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-muted mt-2">No hay estancias registradas.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop/Large Screen Table */}
          <div className="hidden overflow-hidden rounded-xl border border-white/6 bg-white/2 md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/6 bg-white/2">
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-white/50 uppercase lg:px-6 lg:py-4">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-white/50 uppercase lg:px-6 lg:py-4">
                      Inicio
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-white/50 uppercase lg:px-6 lg:py-4">
                      Fin
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-white/50 uppercase lg:px-6 lg:py-4">
                      Duración
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-white/50 uppercase lg:px-6 lg:py-4">
                      Precio
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {stays.map((s) => (
                    <React.Fragment key={s.id}>
                      <tr className="transition-colors hover:bg-white/3">
                        <td className="px-4 py-3 whitespace-nowrap lg:px-6 lg:py-4">
                          <span className="font-medium text-white">
                            {s.userName}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white/70 lg:px-6 lg:py-4">
                          <div>
                            {formatDate(s.startHour)}
                            {admin && s.entryImageUrl && (
                              <div className="mt-2">
                                <ImagePreview
                                  path={s.entryImageUrl}
                                  alt="Entrada"
                                  size="lg"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap lg:px-6 lg:py-4">
                          {s.endHour ? (
                            <span className="text-white/70">
                              <div>
                                {formatDate(s.endHour)}
                                {admin && s.exitImageUrl && (
                                  <div className="mt-2">
                                    <ImagePreview
                                      path={s.exitImageUrl}
                                      alt="Salida"
                                      size="lg"
                                    />
                                  </div>
                                )}
                              </div>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400"></span>
                              En curso
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white/70 lg:px-6 lg:py-4">
                          <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-xs">
                            {formatDuration(s.startHour, s.endHour)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap lg:px-6 lg:py-4">
                          {s.price != null ? (
                            <span className="font-semibold text-green-400">
                              ${Number(s.price).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-white/40">—</span>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {stays.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-white/6 bg-white/2 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-white">{s.userName}</div>
                    <div className="text-muted mt-1 text-xs">
                      {formatDate(s.startHour)} —{" "}
                      {s.endHour ? formatDate(s.endHour) : "En curso"}
                    </div>
                  </div>
                  <div className="text-right">
                    {!s.endHour && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400"></span>
                        Activo
                      </span>
                    )}
                    <div className="text-muted mt-1 font-mono text-xs">
                      {formatDuration(s.startHour, s.endHour)}
                    </div>
                    {s.price != null && (
                      <div className="mt-1 font-semibold text-green-400">
                        ${Number(s.price).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                {admin && (s.entryImageUrl ?? s.exitImageUrl) && (
                  <div className="mt-3 flex justify-center gap-5 border-t border-white/6 pt-3">
                    <div>
                      <ImagePreview
                        path={s.entryImageUrl ?? undefined}
                        alt={`Entrada`}
                        size="lg"
                      />
                      <p>Entrada</p>
                    </div>
                    {s.exitImageUrl && (
                      <div>
                        <ImagePreview
                          path={s.exitImageUrl ?? undefined}
                          alt={`Salida`}
                          size="lg"
                        />
                        <p>Salida</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Stays;
