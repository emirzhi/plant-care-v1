export async function DELETE(request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    const body = await request.json();

    if (!body) return NextResponse.json({ error: "Missing plant info." }, { status: 400 });

    const { list } = body;

    try {
        const response = await supabase.from("plants").delete().in("id", list);

        return NextResponse.json({ response: response.data });
    } catch (error) {
        console.error("Error during plant deleting:", error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}