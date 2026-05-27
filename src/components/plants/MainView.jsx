"use client";

import { useState } from "react";
import Link from "next/link";
import PlantsGrid from "@/components/plants/PlantsGrid";
import { FaHome } from "react-icons/fa";
import { FaSeedling, FaPlus } from "react-icons/fa6";
import { PiCactusFill, PiFlowerFill, PiTreeFill, PiLeafFill, PiTreePalmFill, PiPottedPlantFill } from "react-icons/pi";

const tabs = [
    { label: "All Plants", icon: PiPottedPlantFill },
    { label: "Houseplants", icon: FaHome },
    { label: "Succulents & Cacti", icon: PiCactusFill },
    { label: "Flowering Plants", icon: PiFlowerFill },
    { label: "Trees & Shrubs", icon: PiTreeFill },
    { label: "Herbs & Edibles", icon: PiLeafFill },
    { label: "Ferns & Palms", icon: PiTreePalmFill },
    { label: "Other", icon: FaSeedling },
];
const navLinks = ["My Collection", "My Tasks", "My Reports", "About"];

export default function MainView({ plants = [] }) {
    const [activeTab, setActiveTab] = useState("All Plants");

    return (
        <div className="min-h-screen bg-stone-50 p-6 text-stone-900">
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="flex items-center justify-between rounded-full bg-white px-6 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-400 text-white font-bold">
                            P
                        </span>
                        <span className="font-bold text-stone-900">PlantCare</span>
                    </div>

                    <nav className="flex gap-6 text-sm text-stone-700">
                        {navLinks.map((link) => (
                            <button key={link} type="button" className="hover:text-emerald-700 cursor-pointer">
                                {link}
                            </button>
                        ))}
                    </nav>

                    <button type="button" className="cursor-pointer rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800">
                        Sign Out
                    </button>
                </header>

                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 text-sm">
                        <div className="flex flex-wrap gap-4">
                            {tabs.map(({ label, icon: Icon }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => setActiveTab(label)}
                                    className={
                                        activeTab === label
                                            ? "flex items-center gap-2 border-b-2 border-emerald-400 font-medium text-stone-900 cursor-pointer"
                                            : "flex items-center gap-2 text-stone-600 hover:text-stone-900 cursor-pointer"
                                    }
                                >
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>


                    <Link
                        href="/plants/new"
                        className="cursor-pointer flex flex-row items-center gap-2 rounded-full font-medium text-emerald-500 rounded-full border border-emerald-500 px-4 py-2 text-sm hover:bg-emerald-500 hover:text-white"
                    >
                        <FaPlus className="h-4 w-4" aria-hidden="true" />
                        <span>New</span>
                    </Link>
                </div>

                <PlantsGrid plants={plants} />
            </div>
        </div>
    );
}
