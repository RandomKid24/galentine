import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="relative w-full min-h-[70vh] md:min-h-[90vh] flex flex-col items-center justify-center px-4 md:px-6 overflow-hidden pt-12 md:pt-20">
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 md:w-96 h-64 md:h-96 bg-pink-100/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 -right-20 w-64 md:w-96 h-64 md:h-96 bg-rose-100/30 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-6xl w-full flex flex-col items-center">
        <div className="mb-4 md:mb-6 overflow-hidden">
          <span className="inline-block animate-entrance text-[10px] md:text-[14px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-black text-rose-800 text-center">
            Est. 2026 — An Exclusive Gathering
          </span>
        </div>
        
        <h1 className="text-6xl sm:text-7xl md:text-[12rem] font-serif italic text-rose-950 leading-[0.9] md:leading-[0.8] tracking-tighter mb-4 animate-entrance opacity-0 font-black drop-shadow-sm text-center" style={{animationDelay: '0.2s'}}>
          Galentine's
        </h1>

        {/* Animated Heart Doodle */}
        <div className="mb-8 md:mb-12 animate-entrance opacity-0 flex justify-center items-center" style={{animationDelay: '0.3s'}}>
          <div className="relative">
            <svg 
              className="w-16 h-16 md:w-24 md:h-24 text-rose-500 animate-pulse-gentle transition-transform hover:scale-110 duration-700" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path 
                className="animate-draw-heart"
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
              />
            </svg>
            <div className="absolute inset-0 bg-rose-400/10 blur-xl rounded-full animate-ping-slow"></div>
          </div>
        </div>
        
        <div className="max-w-2xl text-center space-y-6 md:space-y-8 animate-entrance opacity-0 px-2" style={{animationDelay: '0.4s'}}>
          <p className="text-xl md:text-4xl font-display font-bold text-rose-950 leading-snug md:leading-relaxed italic">
            An afternoon of shared secrets, boundless laughter, and the beautiful strength found in sisterhood.
          </p>
          
          <div className="pt-6 md:pt-10">
            <button 
              onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative w-full sm:w-auto px-10 md:px-16 py-5 md:py-7 overflow-hidden rounded-full transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl shadow-rose-200"
            >
              <div className="absolute inset-0 bg-rose-950 group-hover:bg-black transition-colors"></div>
              <span className="relative z-10 text-xs md:text-sm font-black tracking-[0.2em] md:tracking-[0.3em] text-white uppercase flex items-center justify-center gap-4">
                Secure Your Spot
                <svg className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16 md:mt-32 w-full max-w-5xl px-4 md:px-6 animate-entrance opacity-0" style={{animationDelay: '0.6s'}}>
        <div className="relative aspect-square md:aspect-[21/9] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.2)] border-[4px] md:border-[6px] border-white">
          <img 
            src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-10000"
            alt="Event Atmosphere"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 via-transparent to-transparent"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;