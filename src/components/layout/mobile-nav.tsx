'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Landmark, ReceiptText, FileBarChart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bancos', href: '/dashboard/bancos', icon: Landmark },
    { name: 'Extratos', href: '/dashboard/extratos', icon: ReceiptText },
    { name: 'IR', href: '/dashboard/relatorios', icon: FileBarChart },
    { name: 'Perfil', href: '/dashboard/perfil', icon: User },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-t dark:border-zinc-800 pb-safe">
            <nav className="flex items-center justify-around h-16">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                                isActive
                                    ? "text-emerald-600 dark:text-emerald-500"
                                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
