'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
    const scrollToRegistration = () => {
        document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative w-full h-screen flex flex-col items-center justify-center pt-16">
            {/* User Provided Background Image */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url('/hero-bg.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Subtle Overlay to ensure text readability if the image is too bright */}
                <div className="absolute inset-0 bg-white/10"></div>
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl">
                <h2 className="text-4xl md:text-6xl font-serif italic tracking-tight font-medium text-[#4a1024] leading-tight mb-12 drop-shadow-md">
                    Galentine's - The curated experience celebrating womanhood
                </h2>

                <div className="flex flex-col items-center gap-12">
                    <button 
                        onClick={scrollToRegistration}
                        className="flex items-center gap-2 px-8 py-2 rounded-full border border-[#4a1024]/20 text-[#4a1024] bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-all text-sm tracking-widest font-medium shadow-sm"
                    >
                        <ChevronDown className="w-4 h-4" />
                        START
                    </button>

                    <button 
                        onClick={scrollToRegistration}
                        className="text-[#4a1024]/50 hover:text-[#4a1024] transition-colors"
                    >
                        <ChevronDown className="w-8 h-8 animate-bounce" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
