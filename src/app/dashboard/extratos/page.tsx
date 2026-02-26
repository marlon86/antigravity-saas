import ExtratosClient, { Transaction } from './components/ExtratosClient';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTransactions } from '@/app/actions/transactions';
import { getBanks } from '@/app/actions/banks';

export default async function ExtratosPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const transactions = await getTransactions();
    const banks = await getBanks();

    return <ExtratosClient initialTransactions={transactions as Transaction[]} banks={banks} />;
}
