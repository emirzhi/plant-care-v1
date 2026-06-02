export default function NeedRow({ icon: Icon, title, notes, tone = "emerald" }) {
    const amber = tone === "amber";
    return (
        <div className="flex items-start gap-3 bg-white px-4 py-3">
            <div className={amber ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50"} >
                <Icon className={amber ? "h-5 w-5 text-amber-500" : "h-5 w-5 text-emerald-500"} />
            </div>
            <div className="min-w-0 flex-1">
                <p className={amber ? "font-medium text-amber-700" : "font-medium text-stone-900"}>
                    {title}
                </p>
                {notes && (
                    <p className="mt-1 text-xs leading-relaxed text-stone-500">{notes}</p>
                )}
            </div>
        </div>
    );
}
