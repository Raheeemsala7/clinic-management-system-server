'use client';

import React from 'react';
import { DrawingCanvasOverlay } from './drawing-canvas-overlay';

/**
 * رسومات توضيحية تشريحية لأقسام كشف الأنف والأذن والحنجرة
 * تتيح للطبيب الرسم والتحديد بالقلم والممحاة والتعديل التفاعلي
 */

export function EarAnatomyDiagram({
  selectedWeber,
  onSelectWeber,
  drawing,
  onSaveDrawing,
  readOnly = false,
}: {
  selectedWeber?: string;
  onSelectWeber?: (val: string) => void;
  drawing?: string;
  onSaveDrawing?: (dataUrl: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-2xl select-none print:border-none print:p-0 print:bg-transparent">
      <span className="text-[11px] font-black text-[#0A164E] uppercase tracking-wider mb-1 print:hidden">
        Ear & Weber (متاح الرسم والتأشير ✍️)
      </span>

      <DrawingCanvasOverlay
        initialDrawing={drawing}
        onSaveDrawing={onSaveDrawing}
        width={250}
        height={115}
        readOnly={readOnly}
      >
        <div className="flex items-center justify-between w-full px-4 text-black">
          {/* Right Ear */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold mb-0.5">Rt</span>
            <svg className="w-12 h-16 text-black" viewBox="0 0 60 80" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M 30 10 C 15 10, 10 30, 15 50 C 20 70, 45 75, 45 60 C 45 50, 30 50, 30 35 C 30 25, 45 25, 40 10 Z" />
              <circle cx="28" cy="55" r="4" strokeWidth="1.5" />
              <path d="M 28 35 Q 24 45 28 55" strokeDasharray="2 2" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Weber in Center */}
          <div className="flex flex-col items-center px-1">
            <div className="px-2.5 py-1 rounded-full border border-black bg-white text-black font-black text-[11px]">
              Weber
            </div>
            {selectedWeber && (
              <span className="text-[9px] font-bold mt-1 text-blue-700 print:text-black">
                {selectedWeber}
              </span>
            )}
          </div>

          {/* Left Ear */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold mb-0.5">Lt</span>
            <svg className="w-12 h-16 text-black -scale-x-100" viewBox="0 0 60 80" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M 30 10 C 15 10, 10 30, 15 50 C 20 70, 45 75, 45 60 C 45 50, 30 50, 30 35 C 30 25, 45 25, 40 10 Z" />
              <circle cx="28" cy="55" r="4" strokeWidth="1.5" />
              <path d="M 28 35 Q 24 45 28 55" strokeDasharray="2 2" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </DrawingCanvasOverlay>

      {/* أزرار اختبار ويبر السريعة */}
      {!readOnly && (
        <div className="flex items-center gap-1 mt-1.5 print:hidden">
          <span className="text-[10px] font-bold text-slate-500 ml-1">Weber:</span>
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
                    ? 'bg-[#0040D8] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pos}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function NoseAnatomyDiagram({
  drawing,
  onSaveDrawing,
  readOnly = false,
}: {
  drawing?: string;
  onSaveDrawing?: (dataUrl: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-2xl select-none print:border-none print:p-0 print:bg-transparent">
      <span className="text-[11px] font-black text-[#0A164E] uppercase tracking-wider mb-1 print:hidden">
        Nose Pyramid & Septum (متاح الرسم بالقلم ✍️)
      </span>

      <DrawingCanvasOverlay
        initialDrawing={drawing}
        onSaveDrawing={onSaveDrawing}
        width={180}
        height={135}
        readOnly={readOnly}
      >
        <div className="relative w-full h-full flex items-center justify-center text-black">
          <svg className="w-28 h-28 text-black" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            {/* Triangular pyramid outline */}
            <polygon points="50,10 15,90 85,90" strokeWidth="2.5" />
            {/* Central Septum */}
            <line x1="50" y1="10" x2="50" y2="90" strokeWidth="2" strokeDasharray="4 2" />
            {/* Right Turbinates */}
            <circle cx="36" cy="45" r="8" strokeWidth="1.5" strokeDasharray="2 2" />
            <circle cx="30" cy="72" r="11" strokeWidth="1.5" strokeDasharray="2 2" />
            {/* Left Turbinates */}
            <circle cx="64" cy="45" r="8" strokeWidth="1.5" strokeDasharray="2 2" />
            <circle cx="70" cy="72" r="11" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
          <span className="absolute top-2 left-6 text-[11px] font-bold">Rt</span>
          <span className="absolute top-2 right-6 text-[11px] font-bold">Lt</span>
        </div>
      </DrawingCanvasOverlay>
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
    { id: 'Class I', label: 'Class I' },
    { id: 'Class II', label: 'Class II' },
    { id: 'Class III', label: 'Class III' },
    { id: 'Class IV', label: 'Class IV' },
  ];

  return (
    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl select-none print:border-none print:p-0 print:bg-transparent">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-black text-black">Mallampati classification</span>
        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full print:border print:border-black print:text-black print:bg-transparent">
          {selectedClass || 'Class I'}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {classes.map((c) => {
          const isSelected = selectedClass === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect?.(c.id)}
              className={`p-1 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs print:border-black print:text-black print:bg-transparent'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 print:border-none'
              }`}
            >
              <svg className={`w-7 h-7 mx-auto mb-0.5 ${isSelected ? 'text-white print:text-black' : 'text-black'}`} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8">
                <ellipse cx="20" cy="20" rx="16" ry="12" />
                <path d="M 10 18 Q 20 26 30 18" />
                {c.id !== 'Class IV' && <path d="M 18 20 Q 20 28 22 20" fill="currentColor" />}
              </svg>
              <span className="text-[10px] font-bold block">{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LarynxVocalCordDiagram({
  drawing,
  onSaveDrawing,
  readOnly = false,
}: {
  drawing?: string;
  onSaveDrawing?: (dataUrl: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-2xl select-none print:border-none print:p-0 print:bg-transparent">
      <span className="text-[11px] font-black text-[#0A164E] uppercase tracking-wider mb-1 print:hidden">
        Larynx & Vocal Cords (متاح الرسم بالقلم ✍️)
      </span>

      <DrawingCanvasOverlay
        initialDrawing={drawing}
        onSaveDrawing={onSaveDrawing}
        width={160}
        height={130}
        readOnly={readOnly}
      >
        <svg className="w-20 h-20 text-black" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Laryngeal ring outline */}
          <circle cx="40" cy="40" r="32" strokeWidth="2.5" />
          {/* Vocal cords V-shape */}
          <path d="M 40 20 L 26 56 M 40 20 L 54 56" strokeWidth="2.5" />
          {/* Arytenoids */}
          <circle cx="26" cy="56" r="4" fill="currentColor" />
          <circle cx="54" cy="56" r="4" fill="currentColor" />
          {/* Posterior commissure */}
          <line x1="26" y1="56" x2="54" y2="56" strokeWidth="2" strokeDasharray="3 2" />
        </svg>
      </DrawingCanvasOverlay>
    </div>
  );
}
