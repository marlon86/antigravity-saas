'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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
        .order('created_at', { ascending: false })

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

    const balance = balanceStr ? parseFloat(balanceStr) : 0

    const { error } = await supabase
        .from('banks')
        .insert({
            user_id: user.id,
            bank_name: bankName,
            account_type: accountType,
            balance: balance,
            last_sync: new Date().toISOString()
        })

    if (error) {
        console.error('Error adding bank:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/bancos')
    revalidatePath('/dashboard')

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

    return { success: true }
}
