import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const { subscription, timezone } = await request.json();

    if (!subscription?.endpoint) {
        return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
    }

    const patch = { push_subscription: subscription };
    if (typeof timezone === "string" && timezone.length <= 64) patch.timezone = timezone;

    const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id);

    if (error) return NextResponse.json({ error: "Failed to save subscription." }, { status: 500 });

    return NextResponse.json({ ok: true });
}

export async function DELETE() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const { error } = await supabase
        .from("profiles")
        .update({ push_subscription: null })
        .eq("id", user.id);

    if (error) return NextResponse.json({ error: "Failed to clear subscription." }, { status: 500 });

    return NextResponse.json({ ok: true });
}
