import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export async function Topbar() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const initials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name.substring(0, 2).toUpperCase()
        : user?.email?.substring(0, 2).toUpperCase() || 'U';

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 dark:bg-zinc-950 dark:border-zinc-800">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    <Input
                        type="search"
                        placeholder="Buscar transações, bancos..."
                        className="w-full bg-zinc-50 pl-9 dark:bg-zinc-900 border-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>

                <Link href="/dashboard/perfil" className="flex items-center gap-3 border-l pl-4 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-2 rounded-md transition-colors">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100">{user?.user_metadata?.full_name || 'Usuário'}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                    </div>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">{initials}</AvatarFallback>
                    </Avatar>
                </Link>
            </div>
        </header>
    );
}
