"use client";

import { useRef } from "react";
import Image from "next/image";
import { FaCamera, FaImage, FaXmark } from "react-icons/fa6";
import { PiSparkleFill } from "react-icons/pi";

export default function Identify({ photo, onPhotoChange, onIdentify, loading = false }) {
    const cameraRef = useRef(null);
    const fileRef = useRef(null);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        onPhotoChange({ file, previewUrl });
        e.target.value = "";
    };

    const clearPhoto = () => {
        if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
        onPhotoChange(null);
    };

    return (
        <section className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="space-y-1 text-center">
                <h1 className="text-2xl font-semibold text-stone-900">
                    Identify your plant
                </h1>
                <p className="text-sm text-stone-600">
                    Snap a photo or pick one from your device. Clear shots of leaves work best.
                </p>
            </div>

            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50">
                {photo ? (
                    <>
                        <Image
                            src={photo.previewUrl}
                            alt="Selected plant"
                            fill
                            sizes="(max-width: 768px) 100vw, 600px"
                            className="object-cover"
                            unoptimized
                        />
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-900/40 backdrop-blur-sm">
                                <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                                <p className="text-sm font-medium text-white">
                                    Identifying your plant...
                                </p>
                            </div>
                        )}
                        {!loading && (
                            <button
                                type="button"
                                onClick={clearPhoto}
                                className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-stone-700 shadow hover:bg-white"
                                aria-label="Remove photo"
                            >
                                <FaXmark className="h-4 w-4" />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-stone-500">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                            <FaImage className="h-7 w-7 text-emerald-500" />
                        </div>
                        <p className="text-sm">No photo selected yet</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => cameraRef.current?.click()}
                    disabled={loading}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-800 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-stone-200 disabled:hover:text-stone-800"
                >
                    <FaCamera className="h-4 w-4" />
                    Take Photo
                </button>
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={loading}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-800 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-stone-200 disabled:hover:text-stone-800"
                >
                    <FaImage className="h-4 w-4" />
                    From Device
                </button>
            </div>

            <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={handleFile}
            />
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFile}
            />

            <button
                type="button"
                disabled={!photo || loading}
                onClick={() => onIdentify(photo?.file)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
            >
                {loading ? (
                    <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Identifying...
                    </>
                ) : (
                    <>
                        <PiSparkleFill className="h-4 w-4" />
                        Identify with AI
                    </>
                )}
            </button>
        </section>
    );
}
