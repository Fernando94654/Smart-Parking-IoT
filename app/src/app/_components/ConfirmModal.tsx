"use client";

import React from "react";

type Props = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: React.FC<Props> = ({
  title = "Confirma acción",
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative w-full max-w-md p-4">
        <div className="rounded-lg bg-black p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {description && (
                <p className="text-muted mt-2 text-sm">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cerrar"
              className="text-muted rounded p-1 transition-colors duration-150 hover:bg-white/5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="text-muted rounded-md border border-white/6 px-4 py-2 text-sm transition-colors duration-150 hover:bg-white/5 disabled:opacity-50"
              disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="neon-gradient rounded-md px-4 py-2 text-sm text-white transition-transform duration-150 hover:scale-[1.02] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Eliminando..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
