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

                <div className="flex flex-col items-center gap-6">
                    {/* Event Details */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4a1024]/10 to-transparent"></div>
                        <p className="relative text-[#4a1024] text-base md:text-lg font-semibold leading-loose space-y-1 px-6">
                            <span className="block text-shadow-lg">Date: <span className="font-bold text-[#80183b]">20th Feb '26</span></span>
                            <span className="block text-shadow-lg">Time: <span className="font-bold text-[#80183b]">11 AM onwards</span></span>
                            <span className="block text-shadow-lg">Location: <span className="font-bold text-[#80183b]">Elo Cafe, Gangapur Road</span></span>
                        </p>
                        <div className="mt-2 h-0.5 bg-gradient-to-r from-transparent via-[#80183b] to-transparent"></div>
                    </div>

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
