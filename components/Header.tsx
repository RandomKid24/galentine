import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="relative w-full h-[550px] overflow-hidden flex items-center justify-center text-center px-4">
      {/* Background with abstract geometric/feminine pattern */}
      <div className="absolute inset-0 z-0">
         <img 
            src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1920" 
            className="w-full h-full object-cover brightness-[0.7] saturate-[1.2]"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-pink-900/40 via-pink-800/20 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-8 inline-block px-6 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-full text-white text-xs font-bold tracking-[0.3em] uppercase">
          Celebration of Us
        </div>
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-8 drop-shadow-2xl leading-tight">
          Galentine's
        </h1>
        <p className="text-xl md:text-2xl text-pink-50 max-w-2xl mx-auto font-elegant italic drop-shadow-lg leading-relaxed">
          Honoring chosen sisterhood through curate encounters and timeless memories.
        </p>
        
        <div className="mt-16">
          <button 
            onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="group px-8 py-4 bg-white/20 backdrop-blur-xl border border-white/40 rounded-full hover:bg-white hover:text-pink-900 transition-all duration-300 font-bold uppercase tracking-widest text-xs text-white"
          >
            Request Access
          </button>
        </div>
      </div>

      {/* Fade to page background */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#fffafb] to-transparent"></div>
    </header>
  );
};

export default Header;