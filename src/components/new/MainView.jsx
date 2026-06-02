"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa6";
import Identify from "@/components/new/Identify";
import Result from "@/components/new/Result";
import CareSettings from "@/components/new/CareSettings";
import { compressImage, blobToBase64 } from "@/lib/image";

const steps = [
    { key: "identify", label: "Photo" },
    { key: "result", label: "Identify" },
    { key: "care", label: "Care Settings" },
];

export default function MainView() {
    const [step, setStep] = useState("identify");
    const [photo, setPhoto] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [identifyResult, setIdentifyResult] = useState(null);
    const [careSettings, setCareSettings] = useState(null);
    const [base64Photo, setBase64Photo] = useState(null);
    const [nickname, setNickname] = useState("");
    const [location, setLocation] = useState("");
    const [acquiredAt, setAcquiredAt] = useState("");

    const currentIndex = steps.findIndex((s) => s.key === step);

    const handleIdentify = async (file) => {
        setLoading(true);
        try {
            const blob = await compressImage(file);
            const img = await blobToBase64(blob);
            setBase64Photo(img);

            const response = await fetch("/api/identify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ img }),
            });
            const data = await response.json();

            const candidates = [
                {
                    species_scientific: data.primary.scientific_name,
                    species_common: data.primary.common_name,
                    confidence: data.primary.confidence,
                    type: data.primary.type,
                },
                ...(data.alternatives || []).map((a) => ({
                    species_scientific: a.scientific_name,
                    species_common: a.common_name,
                    confidence: a.confidence,
                    type: a.type,
                })),
            ];

            setIdentifyResult({
                candidates,
                healthIssues: data.visible_health_issues || [],
                note: data.note || "",
            });
            setSelected(null);
            setStep("result");
        } catch (error) {
            console.error("Network error during identification:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCareSettings = async (plantName, species) => {
        setLoading(true);
        try {
            const response = await fetch("/api/care", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plantName, species }),
            });
            const data = await response.json();
            setCareSettings(data);
            setStep("care");
        } catch (error) {
            console.error("Network error during care settings generation:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSavePlant = async (tasks) => {
        setLoading(true);
        try {
            const response = await fetch("/api/new", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plant: { ...selected, nickname, location, acquiredAt },
                    healthIssues: identifyResult?.healthIssues || null,
                    care: careSettings,
                    tasks: tasks,
                    file: base64Photo
                }),
            });
            await response.json();
            redirect("/plants");
        } catch (error) {
            console.error("Network error during plant saving:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-stone-50 p-6 text-stone-900">
            <div className="mx-auto max-w-3xl space-y-6">
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
                            src="/image.jpg"
                            alt="Plant Care Logo"
                            width={32}
                            height={32}
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-400 text-white font-bold"
                        />
                        <span className="font-bold text-stone-900 uppercase">Plant Care</span>
                    </div>
                </header>

                <div className="flex items-center justify-center gap-2 text-sm">
                    {steps.map(({ key, label }, i) => {
                        const active = i === currentIndex;
                        const done = i < currentIndex;
                        return (
                            <div key={key} className="flex items-center gap-2">
                                <span
                                    className={
                                        active
                                            ? "flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white"
                                            : done
                                                ? "flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700"
                                                : "flex h-7 w-7 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-500"
                                    }
                                >
                                    {i + 1}
                                </span>
                                <span
                                    className={
                                        active
                                            ? "font-medium text-stone-900"
                                            : done
                                                ? "text-emerald-700"
                                                : "text-stone-500"
                                    }
                                >
                                    {label}
                                </span>
                                {i < steps.length - 1 && (
                                    <span className="mx-2 h-px w-8 bg-stone-300" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {step === "identify" && (
                    <Identify
                        photo={photo}
                        onPhotoChange={setPhoto}
                        onIdentify={handleIdentify}
                        loading={loading}
                    />
                )}

                {step === "result" && (
                    <Result
                        photo={photo}
                        candidates={identifyResult?.candidates}
                        healthIssues={identifyResult?.healthIssues}
                        note={identifyResult?.note}
                        selected={selected}
                        onSelect={setSelected}
                        onBack={() => setStep("identify")}
                        onContinue={() =>
                            handleCareSettings(
                                selected?.species_common,
                                selected?.species_scientific,
                            )
                        }
                        loading={loading}
                    />
                )}

                {step === "care" && (
                    <CareSettings
                        photo={photo}
                        plant={selected}
                        careSettings={careSettings}
                        onBack={() => setStep("result")}
                        onSave={handleSavePlant}
                        loading={loading}
                        nickname={nickname}
                        onNicknameChange={setNickname}
                        setLocation={setLocation}
                        location={location}
                        acquiredAt={acquiredAt}
                        setAcquiredAt={setAcquiredAt}
                    />
                )}
            </div>
        </div>
    );
}
