'use client';

import { useState } from "react";
import Image from "next/image";
import { signInWithEmail, signInWithGoogle } from "@/lib/actions/auth";
import { FcGoogle } from "react-icons/fc";

export default function Form() {
    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signInWithEmail(email);
    };

    const handleGoogleSignIn = async (e) => {
        e.preventDefault();
        await signInWithGoogle();
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-green-100 px-4">
            <div className="w-full max-w-md rounded-3xl border border-green-200 bg-white/80 p-8 shadow-xl backdrop-blur">

                <div className="mb-8 text-center">
                    <Image
                        src="/image.jpg"
                        alt="Plant Care Logo"
                        width={64}
                        height={64}
                        className="mx-auto mb-4 bg-green-100 p-2"
                    />
                    <h1 className="text-3xl font-bold text-green-950">Welcome</h1>
                    <p className="mt-2 text-sm text-green-700">
                        Sign in to continue caring for your plants with AI assistance.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-green-900">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-green-950 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        />
                        <p className="text-xs text-green-600 mt-1">
                            We'll send a secure sign-in link to your email.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
                    >
                        Send Sign-In Link
                    </button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-green-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-sm text-green-600">or</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-green-200 bg-white px-4 py-3 font-semibold text-green-900 shadow-sm transition hover:bg-green-50"
                    >
                        <FcGoogle size={20} />
                        Continue with Google
                    </button>
                </form>
            </div>
        </main>
    );
}