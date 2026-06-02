import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const { data } = await supabase
        .from("profiles")
        .select("timezone, reminder_hour")
        .eq("id", user.id)
        .maybeSingle();

    return NextResponse.json({
        timezone: data?.timezone ?? null,
        reminder_hour: data?.reminder_hour ?? 9,
    });
}

export async function PUT(request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const { timezone, reminder_hour } = await request.json();
    const patch = {};

    if (timezone !== undefined) {
        if (typeof timezone !== "string" || timezone.length > 64) {
            return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
        }
        patch.timezone = timezone;
    }

    if (reminder_hour !== undefined) {
        if (!Number.isInteger(reminder_hour) || reminder_hour < 0 || reminder_hour > 23) {
            return NextResponse.json({ error: "Invalid reminder hour." }, { status: 400 });
        }
        patch.reminder_hour = reminder_hour;
    }

    if (Object.keys(patch).length === 0) {
        return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) return NextResponse.json({ error: "Failed to save preferences." }, { status: 500 });

    return NextResponse.json({ ok: true });
}
