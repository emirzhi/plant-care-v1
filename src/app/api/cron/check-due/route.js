import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendDueReminders } from "@/lib/notifications";

export const runtime = "nodejs";

function authorized(request) {
    const header = request.headers.get("authorization");
    const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
    const provided = bearer || new URL(request.url).searchParams.get("secret");
    return Boolean(provided) && provided === process.env.CRON_SECRET;
}

export async function GET(request) {
    if (!authorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const admin = await getSupabaseAdminClient();
        const result = await sendDueReminders(admin);
        return NextResponse.json({ ok: true, ...result });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
