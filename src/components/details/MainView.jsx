import Image from "next/image";
import Link from "next/link";
import Tasks from "@/components/details/Tasks";
import PlantNeeds from "@/components/details/PlantNeeds";
import { FaArrowLeft } from "react-icons/fa6";
import { PiPottedPlantFill, PiMapPinFill, } from "react-icons/pi";

export default function MainView({ plant, tasks, careProfile }) {
    return (
        <div className="min-h-screen bg-stone-50 p-6 text-stone-900">
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="flex items-center justify-between rounded-full bg-white px-6 py-3 shadow-sm">
                    <Link
                        href="/plants"
                        className="flex items-center gap-2 text-sm text-stone-700 hover:text-emerald-700"
                    >
                        <FaArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Back to collection</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Image
                            src="/icons/image_192x192.png"
                            alt="Plant Care Logo"
                            width={32}
                            height={32}
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-400 text-white font-bold"
                        />
                        <span className="font-bold text-stone-900 uppercase">Plant Care</span>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-3">

                    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                            <div className="relative aspect-square bg-stone-100">
                                {plant.photo_url ? (
                                    <Image
                                        src={plant.photo_url}
                                        alt={plant.species_scientific || "Plant"}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 33vw"
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <PiPottedPlantFill className="h-12 w-12 text-emerald-400" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 p-5">
                                {plant.nickname && (
                                    <p className="text-lg font-semibold text-stone-900">
                                        {plant.nickname}
                                    </p>
                                )}
                                <p className="font-medium italic text-stone-800">
                                    {plant.species_scientific}
                                </p>
                                {plant.species_common && (
                                    <p className="text-sm text-stone-600">{plant.species_common}</p>
                                )}
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Alive
                                </span>
                            </div>
                        </div>

                        {(plant.location_in_home || acquired) && (
                            <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                                {plant.location_in_home && (
                                    <div className="flex items-center gap-2 text-sm text-stone-700">
                                        <PiMapPinFill className="h-4 w-4 shrink-0 text-emerald-500" />
                                        <span>{plant.location_in_home}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>

                    <div className="space-y-6 lg:col-span-2">
                        <Tasks tasks={tasks} />

                        <PlantNeeds care={careProfile} />

                        {plant.health_issues_at_acquisition && (
                            <div className="space-y-2 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                                <h2 className="text-base font-semibold text-stone-900">
                                    Found health issues at identification
                                </h2>
                                <p className="text-sm leading-relaxed text-stone-600">
                                    {plant.health_issues_at_acquisition}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
