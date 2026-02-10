'use client';

import React from 'react';

const Navbar: React.FC = () => {
    return (
        <nav className="w-full bg-[#f8c0ca]/40 backdrop-blur-xl text-[#4a1024] py-6 px-6 md:px-12 flex justify-center items-center sticky top-0 z-[100] border-b border-[#4a1024]/5 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-serif italic tracking-tight font-medium">
                Galentine's <span className="text-xs absolute -bottom-1 right-0 opacity-40 font-sans not-italic font-bold uppercase tracking-widest">by sharedsmilesco</span>
            </h1>
        </nav>
    );
};

export default Navbar;
