import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const { taskId, interval_days, paused } = await request.json();

    if (!taskId) return NextResponse.json({ error: "Missing task id." }, { status: 400 });

    const { data: task, error } = await supabase
        .from("care_tasks")
        .select("id, interval_days, paused")
        .eq("id", taskId)
        .maybeSingle();

    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });

    const newInterval = interval_days ?? task.interval_days;
    const patch = {};

    if (interval_days !== undefined) patch.interval_days = newInterval;
    if (paused !== undefined) patch.paused = paused;

    if (paused === false && task.paused === true) {
        patch.next_due_at = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000).toISOString();
    }

    if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

    const { data: updated, error: updateError } = await supabase
        .from("care_tasks")
        .update(patch)
        .eq("id", taskId)
        .select("id, interval_days, paused, next_due_at")
        .single();

    if (updateError) return NextResponse.json({ error: "Failed to update task." }, { status: 500 });

    return NextResponse.json(updated);
}
