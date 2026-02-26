import RelatoriosClient, { Transaction } from './components/RelatoriosClient';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTransactions } from '@/app/actions/transactions';

export default async function RelatoriosPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const transactions = await getTransactions();

    return <RelatoriosClient initialTransactions={transactions as Transaction[]} />;
}
