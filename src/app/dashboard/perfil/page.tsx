import PerfilClient from './components/PerfilClient';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getProfile } from '@/app/actions/profile';

export default async function PerfilPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const profile = await getProfile();

    return <PerfilClient initialProfile={profile} userEmail={user.email || ''} />;
}
