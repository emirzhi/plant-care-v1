import PlantsCard from "@/components/plants/PlantsCard";

export default function PlantsGrid({ plants = [] }) {
    if (!plants.length) {
        return (
            <div className="rounded-lg border border-stone-200 bg-white p-6 text-center text-stone-600">
                No plants yet.
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plants.map((plant) => (
                <PlantsCard key={plant.id} plant={plant} />
            ))}
        </div>
    );
}
