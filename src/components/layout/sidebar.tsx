'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Landmark, ReceiptText, FileBarChart, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bancos', href: '/dashboard/bancos', icon: Landmark },
    { name: 'Extratos', href: '/dashboard/extratos', icon: ReceiptText },
    { name: 'Relatórios IR', href: '/dashboard/relatorios', icon: FileBarChart },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-white dark:bg-zinc-950 dark:border-zinc-800">
            <div className="flex h-16 items-center border-b px-6 dark:border-zinc-800">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-emerald-600 dark:text-emerald-500">
                    <Landmark className="h-6 w-6" />
                    <span>FinancaSaaS</span>
                </Link>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                isActive
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300',
                                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300',
                                    'mr-3 h-5 w-5 flex-shrink-0'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-4 dark:border-zinc-800">
                <div className="space-y-1">
                    <Link
                        href="/dashboard/config"
                        className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                        <Settings className="mr-3 h-5 w-5 text-zinc-400 group-hover:text-zinc-500" />
                        Configurações
                    </Link>
                    <form action="/auth/logout" method="post">
                        <button
                            type="submit"
                            className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-red-50 hover:text-red-700 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-500 transition-colors"
                        >
                            <LogOut className="mr-3 h-5 w-5 text-zinc-400 group-hover:text-red-700 dark:group-hover:text-red-500" />
                            Sair
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
