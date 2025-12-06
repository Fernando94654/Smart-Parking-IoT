"use client";

import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

const ChangeUserPlate: React.FC = () => {
  const { data: session } = useSession();
  const utils = api.useContext();

  const { data: currentPlate, isLoading: loadingPlate } =
    api.user.getUserPlate.useQuery(undefined, {
      enabled: !!session,
    });

  const updateMutation = api.user.updateUserPlate.useMutation({
    onSuccess: async () => {
      await utils.user.getUserPlate.invalidate();
      setEditing(false);
      setMessage({ type: "success", text: "Placa actualizada" });
      setTimeout(() => setMessage(null), 3000);
      setSubmitting(false);
    },
    onError: (err) => {
      setMessage({
        type: "error",
        text: err?.message ?? "Actualización fallida",
      });
      setTimeout(() => setMessage(null), 4000);
      setSubmitting(false);
    },
  });

  // local submitting flag to provide immediate feedback
  const [submitting, setSubmitting] = useState(false);

  // Safe loading flag: prefer local `submitting` and trpc mutation `status`
  const isLoading = Boolean(submitting || updateMutation.status === "pending");

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (currentPlate) setValue(currentPlate);
  }, [currentPlate]);

  if (!session) {
    return (
      <div className="glass mx-auto max-w-md rounded-lg border border-white/5 p-4">
        <p className="text-muted text-sm">
          Por favor, inicia sesión para ver y cambiar tu placa.
        </p>
      </div>
    );
  }

  const validatePlate = (p: string) => {
    const trimmed = p.trim().toUpperCase();
    // simple validation: 2-8 alphanumeric chars
    return /^[A-Z0-9]{2,8}$/.test(trimmed);
  };

  const onSave = async () => {
    const newPlate = value.trim().toUpperCase();
    if (!validatePlate(newPlate)) {
      setMessage({
        type: "error",
        text: "La placa debe tener entre 2 y 8 caracteres alfanuméricos",
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    // set submitting immediately so the user sees feedback right away
    setSubmitting(true);
    updateMutation.mutate({ newPlateNumber: newPlate });
  };

  return (
    <div className="card-dark relative w-full rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Placa del vehículo
          </h3>
          <p className="text-muted text-sm">Placa registrada actualmente</p>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="neon-gradient inline-flex transform items-center gap-2 rounded-md px-3 py-1 text-white shadow transition hover:-translate-y-0.5 hover:scale-105 hover:opacity-95"
            >
              Editar
            </button>
          ) : (
            <button
              onClick={() => {
                setEditing(false);
                setValue(currentPlate ?? "");
              }}
              className="transform rounded-md border bg-white/5 px-3 py-1 text-white/80 transition hover:-translate-y-0.5 hover:scale-105 hover:bg-white/6"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {loadingPlate ? (
          <div className="text-muted">Cargando...</div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="rounded-md bg-white/6 px-4 py-2 font-mono text-lg tracking-wider text-white">
                {currentPlate ?? "—"}
              </div>
              <div className="text-muted text-sm">
                Puedes cambiarla en cualquier momento.
              </div>
            </div>

            {editing && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  aria-label="Entrada de placa"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={isLoading}
                  className={`w-full min-w-0 flex-1 rounded-md border-2 border-fuchsia-600 px-3 py-2 focus:ring-2 focus:ring-(--accent-1) focus:outline-none ${isLoading ? "opacity-60" : ""}`}
                  placeholder="Ingresa nueva placa (ej. ABC1234)"
                />
                <button
                  onClick={onSave}
                  disabled={isLoading}
                  className={`neon-gradient inline-flex w-full transform items-center justify-center gap-2 rounded-md px-4 py-2 text-white shadow transition disabled:opacity-60 sm:w-auto ${isLoading ? "scale-100 animate-pulse cursor-wait" : "hover:-translate-y-0.5 hover:scale-105"}`}
                >
                  {isLoading ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            )}

            {message && (
              <div
                role="status"
                className={`rounded-md px-3 py-2 text-sm ${message.type === "success" ? "bg-emerald-900 text-emerald-300" : "bg-rose-900 text-rose-300"}`}
              >
                {message.text}
              </div>
            )}
          </div>
        )}
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 rounded-xl bg-white/6">
          <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="font-medium text-white">Enviando...</span>
        </div>
      )}
    </div>
  );
};

export default ChangeUserPlate;
