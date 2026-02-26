import BanksClient, { Bank } from './components/BanksClient';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getBanks } from '@/app/actions/banks';

export default async function BancosPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const banks = await getBanks();

    return <BanksClient initialBanks={banks as Bank[]} />;
}
