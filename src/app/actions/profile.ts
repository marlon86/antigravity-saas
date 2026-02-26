'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }

    return data
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const name = formData.get('name') as string

    // Upsert to handle generic users table logic for MVP
    const { error } = await supabase
        .from('users')
        .upsert({
            id: user.id,
            email: user.email,
            name: name,
        }, { onConflict: 'id' })

    if (error) {
        console.error('Error updating profile:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/perfil')
    revalidatePath('/dashboard')

    await createNotification(
        'Perfil Atualizado',
        'Suas informações de perfil foram salvas com sucesso.',
        'success'
    )

    return { success: true }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        return { error: 'As senhas não coincidem' }
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        console.error('Error updating password:', error)
        return { error: error.message }
    }

    await createNotification(
        'Senha Alterada',
        'Sua senha de acesso foi atualizada com sucesso.',
        'warning'
    )

    return { success: true }
}
