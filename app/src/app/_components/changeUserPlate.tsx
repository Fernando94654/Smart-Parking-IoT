"use client";

import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

const ChangeUserPlate: React.FC = () => {
    const { data: session } = useSession();
    const utils = api.useContext();

    const { data: currentPlate, isLoading: loadingPlate } = api.user.getUserPlate.useQuery(undefined, {
        enabled: !!session,
    });

    const updateMutation = api.user.updateUserPlate.useMutation({
        onSuccess: async () => {
            await utils.user.getUserPlate.invalidate();
            setEditing(false);
            setMessage({ type: "success", text: "Plate updated" });
            setTimeout(() => setMessage(null), 3000);
            setSubmitting(false);
        },
        onError: (err) => {
            setMessage({ type: "error", text: err?.message ?? "Update failed" });
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
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (currentPlate) setValue(currentPlate);
    }, [currentPlate]);

    if (!session) {
        return (
            <div className="max-w-md mx-auto p-4 rounded-lg bg-linear-to-r from-sky-50 to-emerald-50 shadow">
                <p className="text-sm text-sky-700">Please sign in to view and change your plate.</p>
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
            setMessage({ type: "error", text: "Plate must be 2-8 alphanumeric characters" });
            setTimeout(() => setMessage(null), 3000);
            return;
        }
        // set submitting immediately so the user sees feedback right away
        setSubmitting(true);
        updateMutation.mutate({ newPlateNumber: newPlate });
    };

    return (
        <div className="relative max-w-lg mx-auto bg-white/60 backdrop-blur-sm border border-sky-100 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-sky-800">Vehicle Plate</h3>
                    <p className="text-sm text-sky-600">Your currently registered plate</p>
                </div>
                <div className="flex items-center gap-2">
                        {!editing ? (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-linear-to-r from-sky-500 to-emerald-400 text-white shadow hover:opacity-95 transition transform hover:-translate-y-0.5 hover:scale-105"
                                >
                                    Edit
                                </button>
                            ) : (
                        <button
                            onClick={() => {
                                setEditing(false);
                                setValue(currentPlate ?? "");
                            }}
                                    className="px-3 py-1 rounded-md bg-white border text-sky-700 hover:bg-sky-50 transition transform hover:-translate-y-0.5 hover:scale-105"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-4">
                {loadingPlate ? (
                    <div className="text-sky-600">Loading...</div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 rounded-md bg-sky-100 text-sky-800 font-mono text-lg tracking-wider">
                                {currentPlate ?? "—"}
                            </div>
                            <div className="text-sm text-sky-600">You can change this at any time.</div>
                        </div>

                        {editing && (
                            <div className="flex gap-2">
                                <input
                                    aria-label="Plate input"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    disabled={isLoading}
                                    className={`flex-1 px-3 py-2 rounded-md border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-300 ${isLoading ? "opacity-60" : ""}`}
                                    placeholder="Enter new plate (e.g. ABC1234)"
                                />
                                <button
                                    onClick={onSave}
                                    disabled={isLoading}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-linear-to-r from-emerald-400 to-sky-500 text-white shadow disabled:opacity-60 transition transform ${isLoading ? "animate-pulse cursor-wait scale-100" : "hover:-translate-y-0.5 hover:scale-105"}`}
                                >
                                    {isLoading ? (
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                    ) : (
                                        "Save"
                                    )}
                                </button>
                            </div>
                        )}

                        {message && (
                            <div
                                role="status"
                                className={`px-3 py-2 rounded-md text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}
                            >
                                {message.text}
                            </div>
                        )}
                    </div>
                )}
            </div>
                {isLoading && (
                    <div className="absolute inset-0 bg-white/40 rounded-xl flex items-center justify-center gap-3">
                        <svg className="w-5 h-5 animate-spin text-sky-700" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="text-sky-700 font-medium">Sending...</span>
                    </div>
                )}
        </div>
    );
};

export default ChangeUserPlate;