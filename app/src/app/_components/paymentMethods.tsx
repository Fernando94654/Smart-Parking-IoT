"use client";

import React, { useState } from "react";
import type { paymentMethod } from "@prisma/client";
import { api } from "~/trpc/react";
import ConfirmModal from "~/app/_components/ConfirmModal";

// Note: Luhn validation removed per request; require exactly 16 digits.

const PaymentMethods: React.FC = () => {
  const {
    data: methods,
    isLoading,
    refetch,
  } = api.user.getPaymentMethods.useQuery();
  const addMutation = api.user.addPaymentMethod.useMutation({
    onSuccess: () => {
      void refetch();
      setShowForm(false);
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setName("");
      setMessage({ type: "success", text: "Tarjeta añadida correctamente" });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err) => {
      setMessage({
        type: "error",
        text: err?.message ?? "Error al añadir tarjeta",
      });
      setTimeout(() => setMessage(null), 4000);
    },
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const deleteMutation = api.user.deletePaymentMethod.useMutation({
    onSuccess: () => {
      void refetch();
      setMessage({ type: "success", text: "Método eliminado" });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err) => {
      setMessage({
        type: "error",
        text: err?.message ?? "Error al eliminar método",
      });
      setTimeout(() => setMessage(null), 4000);
    },
  });

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<{
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
    name?: string;
  }>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // field-by-field validation with detailed messages
    const newErrors: {
      cardNumber?: string;
      expiry?: string;
      cvv?: string;
      name?: string;
    } = {};

    const digits = cardNumber.replace(/\D/g, "");
    if (!/^\d+$/.test(digits)) {
      newErrors.cardNumber = "El número contiene caracteres no válidos";
    } else if (digits.length !== 16) {
      newErrors.cardNumber = "El número debe tener 16 dígitos";
    }

    const parts = expiry.split("/");
    if (parts.length !== 2) {
      newErrors.expiry = "Formato inválido — use MM/YY o MM/YYYY";
    } else {
      const month = Number(parts[0]);
      const yearStr = parts[1] ?? "";
      const year = Number(yearStr) + (yearStr.length === 2 ? 2000 : 0);
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        newErrors.expiry = "Mes inválido (debe ser 01–12)";
      } else {
        const exp = new Date(year, month - 1, 1);
        const now = new Date();
        if (isNaN(exp.getTime())) newErrors.expiry = "Fecha inválida";
        else if (exp < new Date(now.getFullYear(), now.getMonth(), 1))
          newErrors.expiry = "La tarjeta ya expiró";
      }
    }

    if (!/^[0-9]{3,4}$/.test(cvv)) {
      newErrors.cvv = "CVV inválido — 3 o 4 dígitos numéricos";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setMessage({ type: "error", text: "Corrige los campos marcados" });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    addMutation.mutate({ cardNumber, expiry, cvv, cardHolder: name });
  };

  return (
    <div className="card-dark rounded-xl p-4">
      <h3 className="text-lg font-semibold">Métodos de pago</h3>
      <p className="text-muted text-sm">
        Añade una tarjeta de crédito o débito (simulado).
      </p>

      <div className="mt-4">
        {isLoading ? (
          <div className="text-muted">Cargando métodos…</div>
        ) : (
          <div className="space-y-3">
            {methods && methods.length > 0 ? (
              methods.map((m: paymentMethod) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded border bg-white/3 p-3"
                >
                  <div>
                    <div className="text-sm font-medium text-white">
                      {m.cardHolder}
                    </div>
                    <div className="text-muted text-xs">
                      {m.cardNumber} · Vence {m.expiryDate}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-muted text-sm">Verificada</div>
                    <button
                      type="button"
                      aria-label={`Eliminar método ${m.id}`}
                      onClick={() => {
                        // open custom confirm modal
                        setConfirmDeleteId(m.id);
                      }}
                      className="rounded-md bg-white/5 p-2 hover:bg-white/8"
                      disabled={deletingId !== null}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-rose-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted text-sm">
                No hay métodos guardados.
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={() => {
                  setShowForm((s) => !s);
                  setMessage(null);
                  setErrors({});
                }}
                className="neon-gradient inline-flex items-center gap-2 rounded-md px-4 py-2 text-white shadow"
              >
                {showForm ? "Cancelar" : "Agregar método"}
              </button>
            </div>

            {showForm && (
              <form
                onSubmit={onSubmit}
                className="grid grid-cols-1 gap-2 md:grid-cols-3"
              >
                <div className="col-span-1 md:col-span-2">
                  <input
                    className={`w-full rounded-md border bg-transparent px-3 py-2 ${errors.cardNumber ? "border-rose-600" : "border-white/6"}`}
                    placeholder="Número de tarjeta"
                    value={cardNumber}
                    onChange={(e) => {
                      setCardNumber(e.target.value);
                      if (errors.cardNumber)
                        setErrors((prev) => ({
                          ...prev,
                          cardNumber: undefined,
                        }));
                    }}
                  />
                  {errors.cardNumber && (
                    <div className="mt-1 text-xs text-rose-300">
                      {errors.cardNumber}
                    </div>
                  )}
                </div>

                <div>
                  <input
                    className={`w-full rounded-md border bg-transparent px-3 py-2 ${errors.expiry ? "border-rose-600" : "border-white/6"}`}
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => {
                      setExpiry(e.target.value);
                      if (errors.expiry)
                        setErrors((prev) => ({ ...prev, expiry: undefined }));
                    }}
                  />
                  {errors.expiry && (
                    <div className="mt-1 text-xs text-rose-300">
                      {errors.expiry}
                    </div>
                  )}
                </div>

                <div>
                  <input
                    className={`w-full rounded-md border bg-transparent px-3 py-2 ${errors.cvv ? "border-rose-600" : "border-white/6"}`}
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => {
                      setCvv(e.target.value);
                      if (errors.cvv)
                        setErrors((prev) => ({ ...prev, cvv: undefined }));
                    }}
                  />
                  {errors.cvv && (
                    <div className="mt-1 text-xs text-rose-300">
                      {errors.cvv}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <input
                    className={`w-full rounded-md border bg-transparent px-3 py-2 ${errors.name ? "border-rose-600" : "border-white/6"}`}
                    placeholder="Nombre en la tarjeta (opcional)"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                  />
                  {errors.name && (
                    <div className="mt-1 text-xs text-rose-300">
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="md:col-span-1">
                  <button
                    type="submit"
                    className="neon-gradient inline-flex w-full items-center gap-2 rounded-md px-4 py-2 text-white shadow"
                  >
                    Añadir tarjeta
                  </button>
                </div>
              </form>
            )}

            {message && (
              <div
                className={`rounded-md px-3 py-2 text-sm ${message.type === "success" ? "bg-emerald-900 text-emerald-300" : "bg-rose-900 text-rose-300"}`}
              >
                {message.text}
              </div>
            )}
            {confirmDeleteId && (
              <ConfirmModal
                title="Eliminar método de pago"
                description={`Esta acción eliminará la tarjeta terminada en ${methods?.find((x) => x.id === confirmDeleteId)?.cardNumber?.slice(-4) ?? "****"}. ¿Deseas continuar?`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                loading={deletingId === confirmDeleteId}
                onCancel={() => setConfirmDeleteId(null)}
                onConfirm={() => {
                  const id = confirmDeleteId;
                  if (!id) return;
                  setDeletingId(id);
                  deleteMutation.mutate(
                    { id },
                    {
                      onSettled() {
                        setDeletingId(null);
                        setConfirmDeleteId(null);
                      },
                    },
                  );
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;
