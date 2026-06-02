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
    PiCloudFill,
    PiThermometerFill,
    PiPawPrintFill,
} from "react-icons/pi";

const taskIcons = {
    water: PiDropFill,
    mist: PiDropFill,
    rotate: PiArrowsClockwiseBold,
    fertilize: PiFlaskFill,
    prune: PiScissorsFill,
    sunlight: PiSunFill,
};

const labelize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const buildTasksFromRoutine = (routine) => {
    return [
        {
            task_type: "water",
            interval_days: routine.watering?.interval_days_summer,
            paused: false,
        },
        {
            task_type: "rotate",
            interval_days: routine.rotation_days,
            paused: false,
        },
        {
            task_type: "fertilize",
            interval_days: routine.fertilizing?.interval_days_growing_season,
            paused: false,
        },
        {
            task_type: "mist",
            interval_days: routine.mist?.interval_days,
            paused: false,
        },
    ].filter((t) => t.interval_days != null && t.interval_days > 0);
};

export default function CareSettings({ photo, plant, careSettings, onBack, onSave, loading, nickname, onNicknameChange, location, setLocation, acquiredAt, setAcquiredAt }) {
    const [tasks, setTasks] = useState(() => buildTasksFromRoutine(careSettings));
    const [addingCustomTask, setAddingCustomTask] = useState(false);
    const [customName, setCustomName] = useState("");

    const updateTask = (i, patch) => {
        setTasks((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
    };

    const handleCustomTaskAdd = () => {
        if (!customName.trim()) return;
        setTasks((prev) => [...prev, { task_type: customName.trim().toLowerCase(), interval_days: 1, paused: false }]);
        setCustomName("");
        setAddingCustomTask(false);
    }

    return (
        <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
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
                            onChange={(e) => onNicknameChange(e.target.value)}
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

                {addingCustomTask ? (
                    <div className="flex flex-row items-end gap-3 w-full">
                        <label className="block w-full">
                            <span className="mb-1 block text-sm font-medium text-stone-700">
                                Task name
                            </span>
                            <input
                                type="text"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                placeholder="e.g. Prune"
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                            />
                        </label>
                        <div className="w-15">
                            <button
                                type="button"
                                onClick={() => handleCustomTaskAdd()}
                                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-600"
                            >
                                <PiPlusBold className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setAddingCustomTask(true)}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm text-stone-600 hover:border-emerald-400 hover:text-emerald-700"
                    >
                        <PiPlusBold className="h-4 w-4" />
                        Add custom task
                    </button>
                )}

            </div>

            {careSettings && (
                <div className="space-y-3">
                    <div>
                        <h2 className="text-base font-semibold text-stone-900">Plant needs</h2>
                        <p className="text-xs text-stone-500">
                            From the AI-generated care profile.
                        </p>
                    </div>

                    <div className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
                        <div className="flex items-start gap-3 bg-white px-4 py-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                <PiSunFill className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-stone-900">Light – {careSettings.light?.level}</p>
                                {careSettings.light?.notes && (
                                    <p className="mt-1 text-xs leading-relaxed text-stone-500">
                                        {careSettings.light.notes}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-white px-4 py-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                <PiCloudFill className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-stone-900">Humidity – {careSettings.humidity?.level}</p>
                                {careSettings.humidity?.notes && (
                                    <p className="mt-1 text-xs leading-relaxed text-stone-500">
                                        {careSettings.humidity.notes}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-white px-4 py-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                <PiThermometerFill className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-stone-900">Temperature {careSettings.temperature_range_c
                                    ? `${careSettings.temperature_range_c[0]}–${careSettings.temperature_range_c[1]} °C`
                                    : "—"}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                                    Comfortable indoor range for this species.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-white px-4 py-3">
                            <div
                                className={
                                    careSettings.toxicity?.pets
                                        ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50"
                                        : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50"
                                }
                            >
                                <PiPawPrintFill
                                    className={
                                        careSettings.toxicity?.pets
                                            ? "h-5 w-5 text-amber-500"
                                            : "h-5 w-5 text-emerald-500"
                                    }
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p
                                    className={
                                        careSettings.toxicity?.pets
                                            ? "font-medium text-amber-700"
                                            : "font-medium text-stone-500"
                                    }
                                >
                                    {careSettings.toxicity?.pets ? "Toxic to pets" : "Pet safe"}
                                </p>
                                {careSettings.toxicity?.notes && (
                                    <p className="mt-1 text-xs leading-relaxed text-stone-500">
                                        {careSettings.toxicity.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                    onClick={() => onSave(tasks)}
                    disabled={loading}
                    className="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                    Save Plant
                </button>
            </div>
        </div>
    );
}
