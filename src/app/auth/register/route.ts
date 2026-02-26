import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    const requestUrl = new URL(request.url)
    const formData = await request.formData()
    const email = String(formData.get('email'))
    const password = String(formData.get('password'))
    const name = String(formData.get('name'))
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            },
            emailRedirectTo: `${requestUrl.origin}/auth/callback`,
        },
    })

    if (error) {
        return NextResponse.redirect(`${requestUrl.origin}/register?error=Could not authenticate user`, {
            status: 301,
        })
    }

    // Attempt to sign in immediately (works if email confirmation is disabled in Supabase)
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (!signInError) {
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`, {
            status: 303,
        })
    }

    // Redirect to a check-email page or directly login if auto confirm is on
    return NextResponse.redirect(`${requestUrl.origin}/login?message=Verifique seu email para continuar`, {
        status: 303,
    })
}
