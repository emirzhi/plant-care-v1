import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const body = await request.json();

    if (!body) return NextResponse.json({ error: "Missing plant info." }, { status: 400 });

    const { plant, healthIssues, care, file } = body;

    const { data: imgData, error } = await supabase.storage
        .from("plant-photos")
        .upload(`${user.id}/${crypto.randomUUID()}.jpg`, Buffer.from(file, "base64"), { contentType: "image/jpeg", });

    try {
        const { data: plantData, error: plantError } = await supabase
            .from("plants")
            .insert({
                user_id: user.id,

                species_scientific: plant.species_scientific,
                species_common: plant.species_common || null,

                photo_url: imgData?.path || null,

                type: plant.type || "other",

                health_issues_at_acquisition: healthIssues || null,

                location_in_home: plant.location || null,
                nickname: plant.nickname || null,
                acquired_at: plant.acquiredAt || null,
            })
            .select("id")
            .single();

        if (error || plantError) return NextResponse.json({ error: "Failed to save plant data." }, { status: 500 });

        return NextResponse.json({ success: true, plantId: plantData.id });
    } catch (error) {
        console.error("Error during plant saving:", error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}