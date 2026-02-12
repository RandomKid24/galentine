'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AdminBreadcrumbs from './components/Breadcrumbs';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    // Basic client-side route protection
    // In a production app, use Middleware for server-side protection
    React.useEffect(() => {
        const isAuthenticated = document.cookie.includes('admin_session=authenticated');
        if (!isAuthenticated && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }, [pathname, router]);

    if (pathname === '/admin/login') return <>{children}</>;

    // Prevent rendering of admin shell if not authenticated (prevent layout flash)
    if (typeof document !== 'undefined' && !document.cookie.includes('admin_session=authenticated')) {
        return null;
    }

    const navItems = [
        {
            name: 'Dashboard', href: '/admin', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            )
        },
        {
            name: 'Passes', href: '/admin/passes', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            )
        },
        {
            name: 'SMTP Settings', href: '/admin/settings', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            )
        },
        {
            name: 'Registrations', href: '/admin/registrations', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )
        },
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row">

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 flex-shrink-0 border-r border-rose-100">
                <div className="bg-white p-6 h-full">
                    <div className="mb-6">
                        <h2 className="text-lg font-serif font-bold text-rose-950">Admin Panel</h2>
                        <p className="text-[10px] text-rose-400 font-bold tracking-widest uppercase mt-0.5">Galentine's 2026</p>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-300 font-medium text-xs
                    ${isActive
                                            ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                                            : 'text-rose-900/70 hover:bg-rose-50 hover:text-rose-900'
                                        }
                  `}
                                >
                                    {React.cloneElement(item.icon, { className: 'w-4 h-4' })}
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-6 pt-6 border-t border-rose-50">
                        <button
                            onClick={() => {
                                document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                router.push('/');
                            }}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-rose-400 hover:text-rose-600 transition-colors text-xs font-medium w-full text-left"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 p-6 bg-gray-50">
                <AdminBreadcrumbs />
                {children}
            </main>

        </div>
    );
}
