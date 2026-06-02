"use client";

import { useState } from "react";
import {
    PiDropFill,
    PiArrowsClockwiseBold,
    PiFlaskFill,
    PiScissorsFill,
    PiSunFill,
    PiCheckBold,
    PiPencilSimpleBold,
    PiPauseBold,
    PiPlayBold,
} from "react-icons/pi";

const taskIcons = {
    water: PiDropFill,
    mist: PiDropFill,
    rotate: PiArrowsClockwiseBold,
    fertilize: PiFlaskFill,
    prune: PiScissorsFill,
    sunlight: PiSunFill,
};

const daysUntil = (iso) => Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));

const dueLabel = (days) => {
    if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days} days`;
};

export default function Tasks({ tasks: initialTasks }) {
    const [tasks, setTasks] = useState(initialTasks);
    const [busyId, setBusyId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [draftInterval, setDraftInterval] = useState(1);

    const applyUpdate = (updated) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));

    const markDone = async (task) => {
        setBusyId(task.id);
        try {
            const res = await fetch("/api/tasks/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId: task.id }),
            });
            if (!res.ok) throw new Error("Request failed");
            const { next_due_at } = await res.json();
            applyUpdate({ id: task.id, next_due_at });
        } catch (err) {
            console.error("Failed to mark task done:", err);
        } finally {
            setBusyId(null);
        }
    };

    const updateTask = async (taskId, patch) => {
        setBusyId(taskId);
        try {
            const res = await fetch("/api/tasks/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId, ...patch }),
            });
            if (!res.ok) throw new Error("Request failed");
            const updated = await res.json();
            applyUpdate(updated);
            return true;
        } catch (err) {
            console.error("Failed to update task:", err);
            return false;
        } finally {
            setBusyId(null);
        }
    };

    const startEditing = (task) => {
        setEditingId(task.id);
        setDraftInterval(task.interval_days);
    };

    const saveEditing = async (taskId) => {
        const interval = Number(draftInterval);
        if (!Number.isInteger(interval) || interval < 1) return;
        const ok = await updateTask(taskId, { interval_days: interval });
        if (ok) setEditingId(null);
    };

    return (
        <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div>
                <h2 className="text-base font-semibold text-stone-900">Care tasks</h2>
                <p className="text-xs text-stone-500">
                    Mark a task done, change its interval or pause it.
                </p>
            </div>

            {tasks.length === 0 ? (
                <p className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
                    No care tasks for this plant.
                </p>
            ) : (
                <div className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
                    {tasks.map((task) => {
                        const Icon = taskIcons[task.task_type] || PiDropFill;
                        const days = daysUntil(task.next_due_at);
                        const overdue = !task.paused && days <= 0;
                        const busy = busyId === task.id;
                        const editing = editingId === task.id;

                        return (
                            <div key={task.id} className={task.paused ? "flex items-center gap-3 bg-stone-50 px-4 py-3 opacity-60" : "flex items-center gap-3 bg-white px-4 py-3"}>
                                <div className={overdue ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50"}>
                                    <Icon className={overdue ? "h-5 w-5 text-amber-500" : "h-5 w-5 text-emerald-500"} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-stone-900">
                                        {task.task_type.charAt(0).toUpperCase() + task.task_type.slice(1)}
                                    </p>
                                    {editing ? (
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-xs text-stone-500">every</span>
                                            <input
                                                type="number"
                                                min={1}
                                                value={draftInterval}
                                                onChange={(e) => setDraftInterval(e.target.value)}
                                                className="w-16 rounded-lg border border-stone-200 bg-white px-2 py-1 text-center text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                            />
                                            <span className="text-xs text-stone-500">days</span>
                                        </div>
                                    ) : (
                                        <p className={overdue ? "text-xs font-medium text-amber-600" : "text-xs text-stone-500"}>
                                            {task.paused ? `Paused` : `${dueLabel(days)} · every ${task.interval_days} days`}
                                        </p>
                                    )}
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    {editing ? (
                                        <button
                                            type="button"
                                            onClick={() => saveEditing(task.id)}
                                            disabled={busy}
                                            title="Save"
                                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
                                        >
                                            <PiCheckBold className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <>
                                            {!task.paused && (
                                                <button
                                                    type="button"
                                                    onClick={() => markDone(task)}
                                                    disabled={busy}
                                                    className="flex cursor-pointer items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <PiCheckBold className="h-3.5 w-3.5" />
                                                    {busy ? "Saving…" : "Mark done"}
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => startEditing(task)}
                                                disabled={busy}
                                                title="Edit interval"
                                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-60"
                                            >
                                                <PiPencilSimpleBold className="h-4 w-4" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => updateTask(task.id, { paused: !task.paused })}
                                                disabled={busy}
                                                title={task.paused ? "Resume task" : "Pause task"}
                                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-60"
                                            >
                                                {task.paused ? (
                                                    <PiPlayBold className="h-4 w-4" />
                                                ) : (
                                                    <PiPauseBold className="h-4 w-4" />
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
