'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export async function getBanks() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
        .from('banks')
        .select('*')
        .eq('user_id', user.id)
        .order('last_sync', { ascending: false })

    if (error) {
        console.error('Error fetching banks:', error)
        throw new Error(error.message)
    }

    return data
}

export async function addBank(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const bankName = formData.get('bankName') as string
    const accountType = formData.get('accountType') as string
    const balanceStr = formData.get('balance') as string
    const currency = (formData.get('currency') as string) || 'BRL'

    const balance = balanceStr ? parseFloat(balanceStr) : 0

    // Ensure the user exists in public.users (fallback for users created before trigger)
    const { error: userError } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || null
    }, { onConflict: 'id' })

    if (userError) {
        console.error('Error syncing user to public.users:', userError)
        return { error: 'Erro ao sincronizar usuário: ' + userError.message }
    }

    const { error } = await supabase
        .from('banks')
        .insert({
            user_id: user.id,
            bank_name: bankName,
            account_type: accountType,
            balance: balance,
            currency: currency,
            last_sync: new Date().toISOString()
        })

    if (error) {
        console.error('Error adding bank:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/bancos')
    revalidatePath('/dashboard')

    await createNotification(
        'Novo Banco Adicionado',
        `O banco "${bankName}" foi adicionado com sucesso.`,
        'success'
    )

    return { success: true }
}

export async function deleteBank(bankId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('banks')
        .delete()
        .eq('id', bankId)
        .eq('user_id', user.id) // Extra safety to only allow deleting own banks

    if (error) {
        console.error('Error deleting bank:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/bancos')
    revalidatePath('/dashboard')

    await createNotification(
        'Banco Removido',
        'Uma conta bancária foi removida.',
        'info'
    )

    return { success: true }
}
