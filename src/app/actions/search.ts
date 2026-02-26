'use server'

import { createClient } from '@/utils/supabase/server'

export type SearchResult = {
    id: string
    type: 'bank' | 'transaction'
    title: string
    subtitle: string
    amount?: number
    currency?: string
    date?: string
    url: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const results: SearchResult[] = []
    const searchTerm = `%${query}%`

    // Search Banks
    const { data: banks } = await supabase
        .from('banks')
        .select('*')
        .or(`bank_name.ilike.${searchTerm},account_type.ilike.${searchTerm}`)
        .eq('user_id', user.id)
        .limit(5)

    if (banks) {
        banks.forEach(bank => {
            results.push({
                id: bank.id,
                type: 'bank',
                title: bank.bank_name,
                subtitle: bank.account_type,
                amount: bank.balance,
                currency: bank.currency,
                url: '/dashboard/bancos'
            })
        })
    }

    // Search Transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .or(`description.ilike.${searchTerm},category.ilike.${searchTerm}`)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10)

    if (transactions) {
        transactions.forEach(tx => {
            results.push({
                id: tx.id,
                type: 'transaction',
                title: tx.description,
                subtitle: tx.category,
                amount: tx.amount,
                type_tx: tx.type, // income/expense
                date: tx.date,
                url: '/dashboard/extratos'
            })
        })
    }

    return results
}
