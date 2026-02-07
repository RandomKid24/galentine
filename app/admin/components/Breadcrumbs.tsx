'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminBreadcrumbs() {
    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(segment => segment);

    if (pathSegments.length < 2) return null; // Only show if deeper than root admin

    return (
        <nav className="flex items-center text-sm font-medium text-rose-900/60 mb-6 bg-white w-fit px-4 py-2 rounded-full border border-rose-100 shadow-sm" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {pathSegments.map((segment, index) => {
                    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathSegments.length - 1;
                    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');

                    return (
                        <React.Fragment key={href}>
                            {index > 0 && <span className="text-rose-300">/</span>}
                            <li>
                                {isLast ? (
                                    <span className="text-rose-950 font-bold" aria-current="page">
                                        {label}
                                    </span>
                                ) : (
                                    <Link href={href} className="hover:text-rose-700 transition-colors">
                                        {label}
                                    </Link>
                                )}
                            </li>
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
