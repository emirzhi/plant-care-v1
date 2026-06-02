import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import MainView from "@/components/details/MainView";

export default async function PlantDetail({ params }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/signin");

    const { data: plant, error } = await supabase
        .from("plants")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    const { data: signed } = await supabase.storage
        .from("plant-photos")
        .createSignedUrl(plant.photo_url, 3600);


    const { data: tasks } = await supabase
        .from("care_tasks")
        .select("*")
        .eq("plant_id", id)
        .order("next_due_at", { ascending: true });

    const admin = await getSupabaseAdminClient();
    const { data: profile } = await admin
        .from("care_profiles")
        .select("profile_json")
        .ilike("species_scientific", plant.species_scientific)
        .maybeSingle();

    return (
        <MainView plant={{ ...plant, photo_url: signed?.signedUrl }} tasks={tasks} careProfile={profile?.profile_json} />
    );
}
