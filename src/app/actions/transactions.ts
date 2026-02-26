'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTransactions() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
        .from('transactions')
        .select(`
      *,
      banks ( bank_name )
    `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

    if (error) {
        console.error('Error fetching transactions:', error)
        throw new Error(error.message)
    }

    return data
}

export async function addTransaction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const amountStr = formData.get('amount') as string
    const type = formData.get('type') as string // 'income' ou 'expense'
    const dateStr = formData.get('date') as string
    const isTaxDeductible = formData.get('isTaxDeductible') === 'on'
    const bankId = formData.get('bankId') as string

    const amount = amountStr ? parseFloat(amountStr) : 0

    const { error } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            bank_id: bankId || null,
            description: description,
            category: category,
            amount: amount,
            type: type,
            date: dateStr || new Date().toISOString().split('T')[0],
            is_tax_deductible: isTaxDeductible
        })

    if (error) {
        console.error('Error adding transaction:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/extratos')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/ir')

    return { success: true }
}

export async function deleteTransaction(transactionId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting transaction:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/extratos')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/ir')

    return { success: true }
}

export async function uploadTransactions(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const file = formData.get('file') as File
    const bankId = formData.get('bankId') as string

    if (!file) {
        return { error: 'Nenhum arquivo enviado.' }
    }

    const text = await file.text()

    // Basic CSV parser for MVP
    // Expecting format: date(dd/mm/yyyy), description, amount
    const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0)

    // Skip header if exists (checking if first amount is a number)
    if (rows.length > 0) {
        const firstRowCols = rows[0].split(',')
        if (firstRowCols.length >= 3) {
            const firstAmount = parseFloat(firstRowCols[2])
            if (isNaN(firstAmount)) {
                rows.shift()
            }
        }
    }

    const transactionsToInsert = rows.map(row => {
        const cols = row.split(',')
        if (cols.length < 3) return null;

        // Parse date from DD/MM/YYYY to YYYY-MM-DD
        const dateParts = cols[0].split('/')
        let parsedDate = new Date().toISOString().split('T')[0]
        if (dateParts.length === 3) {
            parsedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        }

        const amount = parseFloat(cols[2]) || 0

        return {
            user_id: user.id,
            bank_id: bankId || null,
            description: cols[1]?.trim() || 'Transação Importada',
            amount: amount,
            type: amount >= 0 ? 'income' : 'expense',
            date: parsedDate,
            category: 'Importado',
            is_tax_deductible: false
        }
    }).filter(Boolean) as any[]

    if (transactionsToInsert.length === 0) {
        return { error: 'Nenhuma transação válida encontrada no arquivo.' }
    }

    const { error } = await supabase
        .from('transactions')
        .insert(transactionsToInsert)

    if (error) {
        console.error('Error importing transactions:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/extratos')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/ir')

    return { success: true, count: transactionsToInsert.length }
}
