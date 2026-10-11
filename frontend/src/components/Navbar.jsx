import React, { useState } from 'react';

export default function Navbar({ currentLang, setLang, t, activePage, setActivePage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t.nav.home },
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'map', label: t.nav.map },
    { id: 'predictionLab', label: t.nav.predictionLab },
    { id: 'storyMode', label: t.nav.storyMode },
    { id: 'methodology', label: t.nav.methodology },
    { id: 'admin', label: t.nav.admin }
  ];

  return (
    <nav className="bg-[#0B192C]/90 backdrop-blur-md border-b border-[#1E3E62] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActivePage('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00ADB5] to-[#00E5FF] flex items-center justify-center shadow-lg shadow-[#00ADB5]/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                {t.brand}
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                  AI Aquifer v1.0
                </span>
              </span>
              <p className="text-[10px] text-gray-400 hidden sm:block">
                Groundwater Intelligence Platform
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActivePage(link.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activePage === link.id
                    ? 'bg-[#1E3E62] text-teal-400 shadow-sm border border-teal-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-[#132A44]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Controls: 3 Language Switcher & Indicator */}
          <div className="flex items-center gap-3">
            <div className="relative inline-flex items-center bg-[#132A44] border border-[#244771] rounded-lg p-1 text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  currentLang === 'en' ? 'bg-teal-500 text-white font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('te')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  currentLang === 'te' ? 'bg-teal-500 text-white font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  currentLang === 'hi' ? 'bg-teal-500 text-white font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#132A44]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-[#0E2238] border-b border-[#1E3E62]">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActivePage(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium ${
                activePage === link.id
                  ? 'bg-[#1E3E62] text-teal-400 font-bold'
                  : 'text-gray-300 hover:bg-[#132A44]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
