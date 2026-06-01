import Image from "next/image";

export default function PlantsCard({ plant }) {

    return (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
            <div className="aspect-square bg-stone-100">
                {plant.photo_url && (
                    <Image
                        src={plant.photo_url}
                        alt={plant.nickname || "Plant"}
                        priority
                        loading="eager"
                        width={400}
                        height={400}
                        className="h-full w-full object-cover"
                    />
                )}
            </div>
            <div className="space-y-2 p-4">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-medium italic text-stone-900">
                        {plant.nickname || plant.species_scientific}
                    </span>
                </div>
                <p className="text-sm text-stone-600">
                    {plant.species_scientific || plant.species_common}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Alive
                </span>
            </div>
        </div>
    );
}
