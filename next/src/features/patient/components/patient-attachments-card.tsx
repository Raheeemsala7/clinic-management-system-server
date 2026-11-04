'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Eye, X } from 'lucide-react';
import { PatientDetails } from '../types/patient';

interface PatientAttachmentsCardProps {
  details: PatientDetails;
}

export function PatientAttachmentsCard({ details }: PatientAttachmentsCardProps) {
  const attachments = details.attachments || [];
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs text-start select-none">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 className="text-base font-black text-[#0A164E]">
          المرفقات والتحاليل
        </h3>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold font-sans">
          {attachments.length} صور
        </span>
      </div>

      {attachments.length === 0 ? (
        <div className="p-6 text-center text-slate-400 text-xs">
          <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p>لا توجد مرفقات أو صور أشعة مسجلة لهذا المريض</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {attachments.map((att, idx) => (
            <button
              key={att.id || idx}
              type="button"
              onClick={() => setPreviewUrl(att.url)}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-blue-400 transition-all cursor-pointer shadow-2xs"
            >
              <Image
                src={att.url}
                alt={att.fileName || 'مرفق طبي'}
                fill
                sizes="(max-width: 768px) 33vw, 120px"
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Eye className="w-5 h-5 drop-shadow-sm" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* مودال معاينة الصورة بحجم كبير */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] w-full bg-white rounded-3xl p-3 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[70vh]">
              <Image
                src={previewUrl}
                alt="معاينة المرفق الطبي"
                fill
                className="object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

