import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
            <div className="hidden lg:block">
                <Sidebar />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden relative pb-16 lg:pb-0">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 mb-safe">
                    {children}
                </main>
                <MobileNav />
            </div>
        </div>
    );
}
