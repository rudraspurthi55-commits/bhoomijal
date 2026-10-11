import React, { useState } from 'react';

export default function StoryMode({ setActivePage, t }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      stage: "Stage 1",
      title: t.story.step1Title,
      desc: t.story.step1Desc,
      icon: "🥀",
      aquiferStatus: "12.5m bgl (Post-Monsoon Illusion)",
      decision: "Ravi planned to sow water-heavy paddy as usual, assuming his borewell would sustain all season.",
      withoutBhoomijal: "Borewell dried up in April. Complete paddy crop failed. Incurred Rs. 1,40,000 drilling debt."
    },
    {
      stage: "Stage 2",
      title: t.story.step2Title,
      desc: t.story.step2Desc,
      icon: "🔔",
      aquiferStatus: "Projected 19.8m bgl (Critical Depletion by Month 4)",
      decision: "Ravi opened Bhoomijal on his mobile in November and checked Medak Central Aquifer.",
      withoutBhoomijal: "Ignored signs of regional depletion and continued deep flood irrigation."
    },
    {
      stage: "Stage 3",
      title: t.story.step3Title,
      desc: t.story.step3Desc,
      icon: "🌱",
      aquiferStatus: "17.2m bgl (Mitigated Stress with Reduced Extraction)",
      decision: "Ravi shifted 60% of land to Pearl Millet (Bajra) & Red Gram. Dug a simple 10ft recharge pit around his borewell.",
      withoutBhoomijal: "Drilled an additional 300ft deeper into dry basalt without recharge, yielding saline water."
    },
    {
      stage: "Stage 4",
      title: t.story.step4Title,
      desc: t.story.step4Desc,
      icon: "🌾",
      aquiferStatus: "16.8m bgl (Aquifer Sustained & Harvest Secured)",
      decision: "Water consumption reduced by 50%. The recharge pit filtered winter rainfall directly into fractures.",
      withoutBhoomijal: "Field abandoned mid-season; family forced into migration."
    }
  ];

  const current = steps[currentStep];

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-wider text-teal-400 font-bold px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20">
          User Story in Practice
        </span>
        <h2 className="text-3xl font-black text-white">{t.story.title}</h2>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto">{t.story.subtitle}</p>
      </div>

      {/* Interactive Step Navigator */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {steps.map((st, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentStep(idx)}
            className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
              currentStep === idx
                ? 'bg-[#1E3E62] border-teal-400 shadow-lg shadow-teal-500/20'
                : 'bg-[#132A44] border-[#244771] text-gray-400 hover:border-teal-500/30'
            }`}
          >
            <span className="text-xs font-bold text-teal-400 block">{st.stage}</span>
            <span className="text-sm font-semibold text-white hidden sm:block truncate mt-1">{st.title}</span>
          </button>
        ))}
      </div>

      {/* Main Story Interactive Card */}
      <div className="bg-[#132A44] border border-[#244771] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-300 flex items-center justify-center text-3xl border border-teal-500/20">
            {current.icon}
          </div>
          <div>
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">{current.stage}</span>
            <h3 className="text-2xl font-bold text-white mt-0.5">{current.title}</h3>
          </div>
        </div>

        <p className="text-base sm:text-lg text-gray-200 leading-relaxed">
          {current.desc}
        </p>

        {/* Aquifer Condition & Farmer Decision */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0E2034] border border-[#1E3E62] rounded-2xl p-5">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wide block mb-1">
              💧 Aquifer State & Ravi's Decision
            </span>
            <div className="mt-2 text-sm text-gray-300 font-medium">
              Water Table: <strong className="text-white">{current.aquiferStatus}</strong>
            </div>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              {current.decision}
            </p>
          </div>

          <div className="bg-[#0E2034] border border-rose-500/30 rounded-2xl p-5">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wide block mb-1">
              ⚠️ Contrast: What Would Happen Without 6-Month Warning?
            </span>
            <p className="mt-2 text-xs text-rose-200 leading-relaxed">
              {current.withoutBhoomijal}
            </p>
          </div>
        </div>

        {/* Stepper Controls */}
        <div className="mt-8 pt-6 border-t border-[#1E3E62] flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl bg-[#0B192C] text-gray-300 border border-[#244771] text-xs font-semibold hover:bg-[#1E3E62] disabled:opacity-30 transition-all"
          >
            ← Previous Chapter
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentStep === i ? 'bg-teal-400 w-6' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2.5 rounded-xl bg-teal-500 text-white text-xs font-bold shadow-md hover:bg-teal-400 transition-all"
            >
              Next Chapter →
            </button>
          ) : (
            <button
              onClick={() => setActivePage('map')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold shadow-md hover:from-teal-400 transition-all"
            >
              Test Map on Your Area 📍
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
