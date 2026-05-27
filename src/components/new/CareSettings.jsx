"use client";

import { useState } from "react";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa6";
import {
    PiDropFill,
    PiSunFill,
    PiArrowsClockwiseBold,
    PiFlaskFill,
    PiScissorsFill,
    PiPlusBold,
    PiPottedPlantFill,
} from "react-icons/pi";

const taskIcons = {
    water: PiDropFill,
    mist: PiDropFill,
    rotate: PiArrowsClockwiseBold,
    fertilize: PiFlaskFill,
    prune: PiScissorsFill,
    sunlight: PiSunFill,
};

const defaultTasks = [
    { task_type: "water", interval_days: 7, paused: false },
    { task_type: "rotate", interval_days: 14, paused: false },
    { task_type: "fertilize", interval_days: 30, paused: false },
    { task_type: "mist", interval_days: 3, paused: true },
];

const labelize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function CareSettings({ photo, plant, onBack }) {
    const [nickname, setNickname] = useState("");
    const [location, setLocation] = useState("");
    const [acquiredAt, setAcquiredAt] = useState("");
    const [tasks, setTasks] = useState(defaultTasks);

    const updateTask = (i, patch) => {
        setTasks((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
    };

    return (
        <section className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 rounded-xl bg-emerald-50/60 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    {photo?.previewUrl ? (
                        <Image
                            src={photo.previewUrl}
                            alt={plant?.species_scientific || "Plant"}
                            fill
                            sizes="64px"
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <PiPottedPlantFill className="h-7 w-7 text-emerald-500" />
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="truncate font-semibold italic text-stone-900">
                        {plant?.species_scientific || "Selected plant"}
                    </p>
                    <p className="truncate text-sm text-stone-600">
                        {plant?.species_common || "—"}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-base font-semibold text-stone-900">Details</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="mb-1 block text-sm font-medium text-stone-700">
                            Nickname (optional)
                        </span>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="e.g. Mona"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1 block text-sm font-medium text-stone-700">
                            Location (optional)
                        </span>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Living room window"
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                    </label>

                    <label className="block sm:col-span-2">
                        <span className="mb-1 block text-sm font-medium text-stone-700">
                            Acquired on (optional)
                        </span>
                        <input
                            type="date"
                            value={acquiredAt}
                            onChange={(e) => setAcquiredAt(e.target.value)}
                            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        />
                    </label>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-stone-900">Care tasks</h2>
                        <p className="text-xs text-stone-500">
                            Suggested by AI. Adjust intervals or pause any task.
                        </p>
                    </div>
                </div>

                <div className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
                    {tasks.map((task, i) => {
                        const Icon = taskIcons[task.task_type] || PiDropFill;
                        return (
                            <div
                                key={task.task_type}
                                className={
                                    task.paused
                                        ? "flex items-center gap-3 bg-stone-50 px-4 py-3 opacity-60"
                                        : "flex items-center gap-3 bg-white px-4 py-3"
                                }
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                    <Icon className="h-5 w-5 text-emerald-500" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-stone-900">
                                        {labelize(task.task_type)}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                        every {task.interval_days} days
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min={1}
                                        value={task.interval_days}
                                        onChange={(e) =>
                                            updateTask(i, {
                                                interval_days: Number(e.target.value),
                                            })
                                        }
                                        className="w-16 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-center text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                    />
                                    <span className="text-xs text-stone-500">days</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => updateTask(i, { paused: !task.paused })}
                                    className={
                                        task.paused
                                            ? "rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600 cursor-pointer hover:bg-white"
                                            : "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 cursor-pointer hover:bg-emerald-100"
                                    }
                                >
                                    {task.paused ? "Paused" : "Active"}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm text-stone-600 hover:border-emerald-400 hover:text-emerald-700"
                >
                    <PiPlusBold className="h-4 w-4" />
                    Add custom task
                </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                    <FaArrowLeft className="h-3.5 w-3.5" />
                    Back
                </button>
                <button
                    type="button"
                    className="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                    Save Plant
                </button>
            </div>
        </section>
    );
}
