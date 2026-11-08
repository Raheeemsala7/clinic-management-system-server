'use client';

import React from 'react';
import { DrawingCanvasOverlay } from './drawing-canvas-overlay';

/**
 * رسومات توضيحية تشريحية لأقسام كشف الأنف والأذن والحنجرة
 * مكبّرة ومطابقة تماماً للأصل الورقي مع إمكانية الرسم والتأشير الحر بالقلم والممحاة
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
    <div className="flex flex-col items-center justify-center p-1 bg-transparent border-none select-none print:border-none print:p-0 print:bg-transparent">
      {/* عنوان الفحص كما في الصورة المرفقة بـ Double Underline */}
      <div className="text-center mb-1.5">
        <span className="font-serif text-2xl sm:text-3xl font-black text-black underline decoration-double underline-offset-4 tracking-wide">
          Ear
        </span>
      </div>

      <DrawingCanvasOverlay
        initialDrawing={drawing}
        onSaveDrawing={onSaveDrawing}
        width={460}
        height={240}
        readOnly={readOnly}
      >
        <div className="flex items-start justify-between w-full h-full px-2 text-black font-serif pt-1">
          {/* Right Ear (الأذن اليمنى) - مطابقة 100% للصورة المرفقة */}
          <div className="flex flex-col items-center">
            <span className="text-lg font-black font-serif mb-1 tracking-tight">Rt</span>
            <svg
              className="w-32 h-46 text-black drop-shadow-2xs"
              viewBox="0 0 110 150"
              fill="none"
              stroke="currentColor"
            >
              {/* إطار طبلة الأذن البيضاوي (Tympanic Ring) */}
              <ellipse
                cx="55"
                cy="78"
                rx="46"
                ry="64"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
              />

              {/* الثنيات المطرية الأمامية والخلفية (Anterior & Posterior Malleolar Folds) */}
              <path
                d="M 11 68 C 22 70, 36 60, 52 50"
                strokeWidth="2.4"
                stroke="currentColor"
                fill="none"
              />
              <path
                d="M 99 74 C 84 68, 72 58, 62 50"
                strokeWidth="2.4"
                stroke="currentColor"
                fill="none"
              />

              {/* مقبض عظمة المطرقة وسرة الطبلة (Manubrium of Malleus & Umbo) */}
              <path
                d="M 52 46 L 50 104 C 50 112, 59 112, 59 104 L 62 46 Z"
                strokeWidth="2.4"
                stroke="currentColor"
                fill="none"
              />
            </svg>
          </div>

          {/* Weber in Center - في المنتصف بين الأذنين */}
          <div className="flex flex-col items-center pt-2">
            <svg
              className="w-28 h-16 text-black"
              viewBox="0 0 110 65"
              fill="none"
              stroke="currentColor"
            >
              <ellipse
                cx="55"
                cy="32"
                rx="50"
                ry="28"
                strokeWidth="2.8"
                stroke="currentColor"
                fill="white"
              />
              <text
                x="55"
                y="39"
                textAnchor="middle"
                fontSize="22"
                fontWeight="bold"
                fontFamily="serif"
                fill="currentColor"
              >
                Weber
              </text>
            </svg>
            {selectedWeber && (
              <span className="text-[10px] font-bold mt-1 text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 print:text-black print:bg-transparent print:border-none">
                {selectedWeber}
              </span>
            )}
          </div>

          {/* Left Ear (الأذن اليسرى) - مطابقة 100% للصورة المرفقة */}
          <div className="flex flex-col items-center">
            <span className="text-lg font-black font-serif mb-1 tracking-tight">Lt</span>
            <svg
              className="w-32 h-46 text-black drop-shadow-2xs"
              viewBox="0 0 110 150"
              fill="none"
              stroke="currentColor"
            >
              {/* إطار طبلة الأذن البيضاوي (Tympanic Ring) */}
              <ellipse
                cx="55"
                cy="78"
                rx="46"
                ry="64"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
              />

              {/* الثنية المطرية الأمامية وبها نتوء وكسرة الزاوية مطابقة للصورة */}
              <path
                d="M 11 76 C 20 78, 25 84, 30 84 C 36 84, 40 72, 44 72 C 48 72, 51 58, 54 52"
                strokeWidth="2.4"
                stroke="currentColor"
                fill="none"
              />
              <path
                d="M 99 64 C 84 62, 72 56, 65 52"
                strokeWidth="2.4"
                stroke="currentColor"
                fill="none"
              />

              {/* مقبض عظمة المطرقة مائل لليمين باتجاه الساعة الخامسة مطابق تماماً للصورة */}
              <path
                d="M 54 48 L 65 106 C 68 114, 76 112, 74 104 L 65 48 Z"
                strokeWidth="2.4"
                stroke="currentColor"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </DrawingCanvasOverlay>

      {/* أزرار اختيار اختبار ويبر السريعة */}
      {!readOnly && (
        <div className="flex items-center gap-1.5 mt-2 print:hidden">
          <span className="text-[11px] font-bold text-slate-600 ml-1">اختبار ويبر (Weber):</span>
          {['Rt', 'Center', 'Lt'].map((pos) => {
            const val = pos === 'Center' ? 'Centralized' : `Lateralized ${pos}`;
            const isSelected = selectedWeber === val;
            return (
              <button
                key={pos}
                type="button"
                onClick={() => onSelectWeber?.(val)}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#0040D8] text-white shadow-2xs scale-105'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {pos === 'Center' ? 'Midline (Center)' : pos}
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
    <div className="flex flex-col items-center justify-center p-2 bg-slate-50/70 border border-slate-200 rounded-2xl select-none print:border-none print:p-0 print:bg-transparent">
      <span className="text-[11px] font-black text-[#0A164E] uppercase tracking-wider mb-1 print:hidden">
        Nose Pyramid & Septum (متاح الرسم بالقلم ✍️)
      </span>

      <DrawingCanvasOverlay
        initialDrawing={drawing}
        onSaveDrawing={onSaveDrawing}
        width={240}
        height={180}
        readOnly={readOnly}
      >
        <div className="relative w-full h-full flex items-center justify-center text-black font-serif">
          <svg
            className="w-36 h-36 text-black"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {/* Triangular pyramid outline */}
            <polygon points="50,10 15,90 85,90" strokeWidth="2.8" />
            {/* Central Septum */}
            <line
              x1="50"
              y1="10"
              x2="50"
              y2="90"
              strokeWidth="2.2"
              strokeDasharray="4 2"
            />
            {/* Right Turbinates */}
            <circle cx="36" cy="45" r="9" strokeWidth="1.8" strokeDasharray="3 2" />
            <circle cx="30" cy="72" r="12" strokeWidth="1.8" strokeDasharray="3 2" />
            {/* Left Turbinates */}
            <circle cx="64" cy="45" r="9" strokeWidth="1.8" strokeDasharray="3 2" />
            <circle cx="70" cy="72" r="12" strokeWidth="1.8" strokeDasharray="3 2" />
          </svg>
          <span className="absolute top-3 left-4 text-sm font-black">Rt</span>
          <span className="absolute top-3 right-4 text-sm font-black">Lt</span>
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
    <div className="p-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl select-none print:border-none print:p-0 print:bg-transparent">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black text-black">Mallampati classification</span>
        <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full print:border print:border-black print:text-black print:bg-transparent">
          {selectedClass || 'Class I'}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {classes.map((c) => {
          const isSelected = selectedClass === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect?.(c.id)}
              className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs print:border-black print:text-black print:bg-transparent'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 print:border-none'
              }`}
            >
              <svg
                className={`w-9 h-9 mx-auto mb-1 ${
                  isSelected ? 'text-white print:text-black' : 'text-black'
                }`}
                viewBox="0 0 40 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <ellipse cx="20" cy="20" rx="16" ry="12" />
                <path d="M 10 18 Q 20 26 30 18" />
                {c.id !== 'Class IV' && (
                  <path d="M 18 20 Q 20 28 22 20" fill="currentColor" />
                )}
              </svg>
              <span className="text-[11px] font-black block">{c.label}</span>
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
    <div className="flex flex-col items-center justify-center p-2 bg-slate-50/70 border border-slate-200 rounded-2xl select-none print:border-none print:p-0 print:bg-transparent">
      <span className="text-[11px] font-black text-[#0A164E] uppercase tracking-wider mb-1 print:hidden">
        Larynx & Vocal Cords (متاح الرسم بالقلم ✍️)
      </span>

      <DrawingCanvasOverlay
        initialDrawing={drawing}
        onSaveDrawing={onSaveDrawing}
        width={220}
        height={180}
        readOnly={readOnly}
      >
        <svg
          className="w-28 h-28 text-black"
          viewBox="0 0 80 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {/* Laryngeal ring outline */}
          <circle cx="40" cy="40" r="34" strokeWidth="2.8" />
          {/* Vocal cords V-shape */}
          <path d="M 40 18 L 24 58 M 40 18 L 56 58" strokeWidth="2.8" />
          {/* Arytenoids */}
          <circle cx="24" cy="58" r="4.5" fill="currentColor" />
          <circle cx="56" cy="58" r="4.5" fill="currentColor" />
          {/* Posterior commissure */}
          <line x1="24" y1="58" x2="56" y2="58" strokeWidth="2" strokeDasharray="3 2" />
        </svg>
      </DrawingCanvasOverlay>
    </div>
  );
}
