'use server';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signInWithEmail(email) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/plants`
        }
    });
}

export async function signInWithGoogle() {
    const supabase = await createClient();
    const origin = (await headers()).get("origin");
    
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback?next=/plants`
        }
    });

    if (data.url) {
        redirect(data.url);
    }
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/signin");
}