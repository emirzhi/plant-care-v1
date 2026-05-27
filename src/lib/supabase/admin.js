import { createClient } from '@supabase/supabase-js'

export async function getSupabaseAdminClient() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // Access auth admin api
    return supabase.auth.admin
}