import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    const requestUrl = new URL(request.url)
    const formData = await request.formData()
    const email = String(formData.get('email'))
    const password = String(formData.get('password'))
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    // Optionally return some auth-error URL or flash message
    if (error) {
        console.error('Login error:', error.message)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`, {
            status: 301,
        })
    }

    // Use 303 Redirect to force a GET request logic to the dashboard
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`, {
        status: 303,
    })
}
