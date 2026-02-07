'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * Background Component
 * Renders the multi-layered visual background.
 * Automatically simplifies itself in the /admin section to ensure high performance.
 */
const Background = () => {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return (
            <div className="fixed inset-0 bg-[#fff9fb] -z-10">
                <div className="mesh-bg opacity-30"></div>
                <div className="noise-texture opacity-5s"></div>
            </div>
        );
    }

    return (
        <>
            <div className="mesh-bg"></div>
            <div className="noise-texture"></div>
            <div className="floral-overlay"></div>

            {/* Sophisticated Lighting Blobs */}
            <div className="bg-blob w-[900px] h-[900px] bg-rose-100/40 -top-40 -left-40 animate-float-slow"></div>
            <div className="bg-blob w-[750px] h-[750px] bg-emerald-50/30 top-1/4 -right-40 animate-float-medium"></div>
            <div className="bg-blob w-[1000px] h-[1000px] bg-purple-50/40 bottom-0 left-1/4 animate-float-fast"></div>
            <div className="bg-blob w-[600px] h-[600px] bg-amber-50/30 top-2/3 left-0 animate-float-slow" style={{ animationDuration: '45s' }}></div>
        </>
    );
};

export default Background;
