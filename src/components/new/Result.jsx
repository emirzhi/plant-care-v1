"use client";

import Image from "next/image";
import { FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa6";
import { PiPottedPlantFill, PiWarningFill, PiInfoFill } from "react-icons/pi";

export default function Result({
    photo,
    candidates = [],
    healthIssues = [],
    note = "",
    selected,
    onSelect,
    onBack,
    onContinue,
}) {
    return (
        <section className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    {photo?.previewUrl && (
                        <Image
                            src={photo.previewUrl}
                            alt="Submitted plant"
                            fill
                            sizes="80px"
                            className="object-cover"
                            unoptimized
                        />
                    )}
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-stone-900">
                        Possible matches
                    </h1>
                    <p className="text-sm text-stone-600">
                        Pick the one that looks right, then continue.
                    </p>
                </div>
            </div>

            {note && (
                <div className="flex gap-3 rounded-xl bg-emerald-50/60 p-4">
                    <PiInfoFill className="h-5 w-5 shrink-0 text-emerald-600" />
                    <p className="text-sm leading-relaxed text-stone-700">{note}</p>
                </div>
            )}

            <div className="space-y-3">
                {candidates.map((c) => {
                    const isSelected = selected?.species_scientific === c.species_scientific;
                    const pct = Math.round(c.confidence * 100);
                    return (
                        <div key={c.species_scientific}>
                            <button
                                type="button"
                                onClick={() => onSelect(c)}
                                className={
                                    isSelected
                                        ? "flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 p-4 text-left transition"
                                        : "flex w-full cursor-pointer items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 text-left transition hover:border-emerald-300"
                                }
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                    <PiPottedPlantFill className="h-6 w-6 text-emerald-500" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium italic text-stone-900">
                                        {c.species_scientific}
                                    </p>
                                    <p className="truncate text-sm text-stone-600">
                                        {c.species_common}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                                            <div
                                                className="h-full rounded-full bg-emerald-400"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="w-10 text-right text-xs font-medium text-stone-600">
                                            {pct}%
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className={
                                        isSelected
                                            ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                                            : "h-6 w-6 shrink-0 rounded-full border-2 border-stone-300"
                                    }
                                >
                                    {isSelected && <FaCheck className="h-3 w-3" />}
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>

            {healthIssues.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <PiWarningFill className="h-5 w-5 text-amber-500" />
                        <h2 className="text-sm font-semibold text-amber-900">
                            Visible health issues
                        </h2>
                    </div>
                    <div className="ml-7 list-disc space-y-1 text-sm text-amber-900/80">
                        {healthIssues.map((issue, i) => (
                            <div key={i}>{issue}</div>
                        ))}
                    </div>
                </div>
            )}

            <button
                type="button"
                className="w-full cursor-pointer rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm text-stone-600 hover:border-stone-400 hover:text-stone-800"
            >
                None of these match
            </button>

            <div className="flex items-center justify-between gap-3 pt-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                    <FaArrowLeft className="h-3.5 w-3.5" />
                    Retake
                </button>
                <button
                    type="button"
                    disabled={!selected}
                    onClick={onContinue}
                    className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
                >
                    Continue
                    <FaArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </section>
    );
}
