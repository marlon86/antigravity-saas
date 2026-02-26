import DashboardClient, { Transaction } from './components/DashboardClient';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTransactions } from '@/app/actions/transactions';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const transactions = await getTransactions();

    return <DashboardClient initialTransactions={transactions as Transaction[]} />;
}
