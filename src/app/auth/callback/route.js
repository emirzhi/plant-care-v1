import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    // parameters for email signin callback
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    let next = searchParams.get('next') ?? '/';

    if (!next.startsWith('/')) {
        next = '/'
    }

    const supabase = await createClient();
    let error;
    if (code) {
        ({ error } = await supabase.auth.exchangeCodeForSession(code));
    } else if (token_hash && type) {
        ({ error } = await supabase.auth.verifyOtp({
            token_hash: token_hash,
            type: type,
        }));
    }

    if (!error) {
        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        if (isLocalEnv) {
            return NextResponse.redirect(new URL(next, origin));
        } else if (forwardedHost) {
            return NextResponse.redirect(new URL(next, `https://${forwardedHost}`));
        } else {
            return NextResponse.redirect(new URL(next, origin));
        }
    }

    return NextResponse.redirect(new URL('/auth/auth-code-error', origin));
}