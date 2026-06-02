"use client";

import { useEffect, useState } from "react";
import { PiBellFill, PiXBold } from "react-icons/pi";
import {
    pushSupported,
    getExistingSubscription,
    enablePush,
    disablePush,
    detectTimezone,
    getPreferences,
    savePreferences,
} from "@/lib/webPushClient";

const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);

export default function SettingsModal({ open, onClose }) {
    const [supported, setSupported] = useState(true);
    const [enabled, setEnabled] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const [reminderHour, setReminderHour] = useState(9);
    const [timezone, setTimezone] = useState("");
    const [savedHour, setSavedHour] = useState(false);

    useEffect(() => {
        if (!open) return;
        setError(null);
        setSavedHour(false);

        if (!pushSupported()) {
            setSupported(false);
            return;
        }

        let active = true;
        getExistingSubscription().then((sub) => {
            if (active) setEnabled(Boolean(sub));
        });
        return () => {
            active = false;
        };
    }, [open]);

    useEffect(() => {
        if (!open || !enabled) return;

        let active = true;
        getPreferences()
            .then((prefs) => {
                if (!active) return;
                setReminderHour(prefs.reminder_hour ?? 9);
                setTimezone(prefs.timezone || detectTimezone());
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [open, enabled]);

    if (!open) return null;

    const toggle = async () => {
        setBusy(true);
        setError(null);
        try {
            if (enabled) {
                await disablePush();
                setEnabled(false);
            } else {
                await enablePush();
                setEnabled(true);
            }
        } catch (e) {
            setError(e.message || "Something went wrong.");
        } finally {
            setBusy(false);
        }
    };

    const changeHour = async (hour) => {
        setReminderHour(hour);
        setSavedHour(false);
        try {
            await savePreferences({ reminder_hour: hour, timezone: timezone || detectTimezone() });
            setSavedHour(true);
        } catch (e) {
            setError(e.message || "Could not save the reminder time.");
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-stone-900">Settings</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"
                    >
                        <PiXBold className="h-4 w-4" />
                    </button>
                </div>

                <div className="rounded-xl border border-stone-200 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                            <PiBellFill className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-stone-900">Care reminders</p>
                            <p className="text-xs text-stone-500">
                                Get a push notification when your plants are due for watering,
                                feeding or other care.
                            </p>
                        </div>
                    </div>

                    {!supported ? (
                        <p className="mt-3 text-sm text-amber-600">
                            This browser doesn&apos;t support push notifications.
                        </p>
                    ) : (
                        <>
                            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                            {enabled && (
                                <div className="mt-4 border-t border-stone-100 pt-4">
                                    <label className="flex items-center justify-between gap-3 text-sm">
                                        <span className="font-medium text-stone-900">Remind me at</span>
                                        <select
                                            value={reminderHour}
                                            onChange={(e) => changeHour(Number(e.target.value))}
                                            className="cursor-pointer rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                        >
                                            {HOURS.map((label, hour) => (
                                                <option key={hour} value={hour}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <p className="mt-1.5 text-xs text-stone-500">
                                        Times are for your timezone
                                        {timezone ? ` (${timezone})` : ""}.
                                        {savedHour && <span className="text-emerald-600"> Saved</span>}
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={toggle}
                                disabled={busy}
                                className={
                                    enabled
                                        ? "mt-4 w-full cursor-pointer rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
                                        : "mt-4 w-full cursor-pointer rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                                }
                            >
                                {busy
                                    ? "Working…"
                                    : enabled
                                        ? "Turn off reminders"
                                        : "Turn on reminders"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
