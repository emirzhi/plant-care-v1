"use client";

import { useState } from "react";
import { PiSunFill, PiCloudFill, PiThermometerFill, PiPawPrintFill, PiDropFill, PiCaretDownBold, } from "react-icons/pi";
import NeedRow from "@/components/details/NeedRow";

export default function PlantNeeds({ care }) {
    const [openProblems, setOpenProblems] = useState({});

    const toggleProblem = (i) => setOpenProblems((prev) => ({ ...prev, [i]: !prev[i] }));

    return (
        <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div>
                <h2 className="text-base font-semibold text-stone-900">Plant needs</h2>
                <p className="text-xs text-stone-500">From the AI-generated care profile.</p>
            </div>

            <div className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
                <NeedRow
                    icon={PiSunFill}
                    title={`Light – ${care.light?.level ?? "—"}`}
                    notes={care.light?.notes}
                />
                <NeedRow
                    icon={PiCloudFill}
                    title={`Humidity – ${care.humidity?.level ?? "—"}`}
                    notes={care.humidity?.notes}
                />
                <NeedRow
                    icon={PiThermometerFill}
                    title={`Temperature ${care.temperature_range_c ? `${care.temperature_range_c[0]}–${care.temperature_range_c[1]} °C` : "—"}`}
                    notes="Comfortable indoor range for this species."
                />
                <NeedRow
                    icon={PiDropFill}
                    title="Watering"
                    notes={care.watering?.method}
                />
                <NeedRow
                    icon={PiPawPrintFill}
                    tone={care.toxicity?.pets ? "amber" : "emerald"}
                    title={care.toxicity?.pets ? "Toxic to pets" : "Pet safe"}
                    notes={care.toxicity?.notes}
                />
            </div>

            {care.common_problems?.length > 0 && (
                <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-semibold text-stone-900">Common problems</h3>
                    <div className="space-y-2">
                        {care.common_problems.map((p, i) => {
                            const isOpen = openProblems[i];
                            return (
                                <div key={i} className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 text-sm" >
                                    <button
                                        type="button"
                                        onClick={() => toggleProblem(i)}
                                        aria-expanded={isOpen}
                                        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left font-medium text-stone-800"
                                    >
                                        {p.symptom}
                                        <PiCaretDownBold
                                            className={`h-3.5 w-3.5 shrink-0 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div className="px-4 pb-3">
                                            <p className="text-stone-600">
                                                <span className="font-medium text-stone-700">Cause:</span> {p.cause}
                                            </p>
                                            <p className="mt-1 text-stone-600">
                                                <span className="font-medium text-stone-700">Fix:</span> {p.fix}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
