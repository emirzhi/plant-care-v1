import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MainView from "@/components/id/MainView";

export default async function PlantDetail({ params }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/signin");

    const { data, error } = await supabase.from("plants").select("*").eq("id", id).maybeSingle();

    const paths = data
        .filter(plant => plant.photo_url)
        .map(plant => plant.photo_url);

    const { data: signed, error: signedError } = await supabase.storage
        .from("plant-photos")
        .createSignedUrls(paths, 3600);

    const plantsWithPhotos = data.map((plant) => {
        const signedUrlObj = signed.find((s) => s.path === plant.photo_url);

        return {
            ...plant,
            photo_url: signedUrlObj ? signedUrlObj.signedUrl : null,
        };
    })

    return <MainView plants={plantsWithPhotos} />
}