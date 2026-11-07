import React from 'react';

/**
 * رسومات توضيحية تشريحية لأقسام كشف الأنف والأذن والحنجرة
 * مطابقة للورقة المطبوعة للعيادة
 */

export function EarAnatomyDiagram({
  selectedWeber,
  onSelectWeber,
}: {
  selectedWeber?: string;
  onSelectWeber?: (val: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl select-none">
      <span className="text-xs font-black text-[#0A164E] uppercase tracking-wider mb-2">
        Ear & Weber Test
      </span>
      <div className="flex items-center gap-6">
        {/* Right Ear */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-bold text-slate-500 mb-1">Rt</span>
          <svg className="w-14 h-18 text-slate-700" viewBox="0 0 60 80" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M 30 10 C 15 10, 10 30, 15 50 C 20 70, 45 75, 45 60 C 45 50, 30 50, 30 35 C 30 25, 45 25, 40 10 Z" />
            <circle cx="28" cy="55" r="4" strokeWidth="1.5" className="fill-blue-100" />
            <path d="M 28 35 Q 24 45 28 55" strokeDasharray="2 2" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Weber in Center */}
        <div className="flex flex-col items-center">
          <div className="px-3 py-1.5 rounded-full border-2 border-dashed border-[#0040D8] bg-white text-[#0040D8] font-black text-xs shadow-2xs">
            Weber
          </div>
          <div className="flex items-center gap-1 mt-2">
            {['Rt', 'Center', 'Lt'].map((pos) => {
              const val = pos === 'Center' ? 'Centralized' : `Lateralized ${pos}`;
              const isSelected = selectedWeber === val;
              return (
                <button
                  key={pos}
                  type="button"
                  onClick={() => onSelectWeber?.(val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0040D8] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pos}
                </button>
              );
            })}
          </div>
        </div>

        {/* Left Ear */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-bold text-slate-500 mb-1">Lt</span>
          <svg className="w-14 h-18 text-slate-700 -scale-x-100" viewBox="0 0 60 80" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M 30 10 C 15 10, 10 30, 15 50 C 20 70, 45 75, 45 60 C 45 50, 30 50, 30 35 C 30 25, 45 25, 40 10 Z" />
            <circle cx="28" cy="55" r="4" strokeWidth="1.5" className="fill-blue-100" />
            <path d="M 28 35 Q 24 45 28 55" strokeDasharray="2 2" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function NoseAnatomyDiagram() {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl select-none">
      <span className="text-xs font-black text-[#0A164E] uppercase tracking-wider mb-2">
        Nose Pyramid & Septum
      </span>
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full text-slate-700" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Triangular pyramid outline */}
          <polygon points="50,10 15,90 85,90" strokeWidth="2.5" />
          {/* Central Septum */}
          <line x1="50" y1="10" x2="50" y2="90" strokeWidth="2" strokeDasharray="4 2" stroke="#0040D8" />
          {/* Right Turbinates */}
          <circle cx="36" cy="45" r="8" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="30" cy="72" r="11" strokeWidth="1.5" strokeDasharray="2 2" />
          {/* Left Turbinates */}
          <circle cx="64" cy="45" r="8" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="70" cy="72" r="11" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
        <span className="absolute top-2 left-2 text-[10px] font-bold text-slate-500">Rt</span>
        <span className="absolute top-2 right-2 text-[10px] font-bold text-slate-500">Lt</span>
      </div>
    </div>
  );
}

export function MallampatiSelector({
  selectedClass,
  onSelect,
}: {
  selectedClass?: string;
  onSelect?: (val: string) => void;
}) {
  const classes = [
    { id: 'Class I', label: 'Class I', desc: 'Soft palate, fauces, uvula, pillars visible' },
    { id: 'Class II', label: 'Class II', desc: 'Soft palate, fauces, portion of uvula visible' },
    { id: 'Class III', label: 'Class III', desc: 'Soft palate, base of uvula visible' },
    { id: 'Class IV', label: 'Class IV', desc: 'Hard palate only visible' },
  ];

  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black text-[#0A164E]">Mallampati Classification</span>
        <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
          {selectedClass || 'اختر التصنيف'}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {classes.map((c) => {
          const isSelected = selectedClass === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect?.(c.id)}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0040D8] text-white border-[#0040D8] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {/* Mouth icon illustration */}
              <svg className={`w-8 h-8 mx-auto mb-1 ${isSelected ? 'text-white' : 'text-slate-600'}`} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8">
                <ellipse cx="20" cy="20" rx="16" ry="12" />
                <path d="M 10 18 Q 20 26 30 18" />
                {c.id !== 'Class IV' && <path d="M 18 20 Q 20 28 22 20" fill="currentColor" />}
              </svg>
              <span className="text-[11px] font-black block">{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LarynxVocalCordDiagram() {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl select-none">
      <span className="text-xs font-black text-[#0A164E] uppercase tracking-wider mb-2">
        Larynx & Vocal Cords
      </span>
      <svg className="w-20 h-20 text-slate-700" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Laryngeal ring outline */}
        <circle cx="40" cy="40" r="32" strokeWidth="2.5" />
        {/* Vocal cords V-shape */}
        <path d="M 40 20 L 26 56 M 40 20 L 54 56" strokeWidth="2.5" stroke="#0040D8" />
        {/* Arytenoids */}
        <circle cx="26" cy="56" r="4" fill="#0040D8" />
        <circle cx="54" cy="56" r="4" fill="#0040D8" />
        {/* Posterior commissure */}
        <line x1="26" y1="56" x2="54" y2="56" strokeWidth="2" strokeDasharray="3 2" />
      </svg>
    </div>
  );
}

