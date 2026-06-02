import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const { taskId } = await request.json();

    if (!taskId) return NextResponse.json({ error: "Missing task id." }, { status: 400 });

    const { data: task, error } = await supabase
        .from("care_tasks")
        .select("id, interval_days")
        .eq("id", taskId)
        .maybeSingle();

    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });

    const next_due_at = new Date(Date.now() + task.interval_days * 24 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
        .from("care_tasks")
        .update({ next_due_at })
        .eq("id", taskId);

    if (updateError) return NextResponse.json({ error: "Failed to update task." }, { status: 500 });

    return NextResponse.json({ next_due_at });
}
