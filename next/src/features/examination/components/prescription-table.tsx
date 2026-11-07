'use client';

import React from 'react';
import { Plus, Trash2, Pill, Printer, Sparkles } from 'lucide-react';
import { PrescriptionMedicine } from '../types/ent-examination.types';

interface PrescriptionTableProps {
  items: PrescriptionMedicine[];
  onChange: (items: PrescriptionMedicine[]) => void;
  onPrint?: () => void;
}

const COMMON_ENT_DRUGS: Array<Omit<PrescriptionMedicine, 'id'>> = [
  { drugName: 'Augmentin 1gm', dose: '1 قرص', frequency: 'كل 12 ساعة', duration: '7 أيام', instructions: 'بعد الأكل' },
  { drugName: 'Otrivin Adult Nasal Spray', dose: 'بخة بكل فتحة أنف', frequency: 'مرتين يومياً', duration: '5 أيام', instructions: 'لا يُستخدم أكثر من 5 أيام' },
  { drugName: 'Zyrtec 10mg (Cetirizine)', dose: '1 قرص', frequency: 'مساءً قبل النوم', duration: '10 أيام', instructions: 'يسبب بعض النعاس' },
  { drugName: 'Cataflam 50mg', dose: '1 قرص', frequency: 'عند اللزوم بعد الأكل', duration: '5 أيام', instructions: 'مسكن ومضاد للالتهاب' },
  { drugName: 'Otocort Ear Drops', dose: '3 نقط في الأذن', frequency: '3 مرات يومياً', duration: '7 أيام', instructions: 'تدفئة القطرة قبل الاستخدام' },
  { drugName: 'Bbc Mouth Spray', dose: 'بختين في الفم', frequency: '3 مرات يومياً', duration: '5 أيام', instructions: 'مطهر ومسكن للحلق' },
];

export function PrescriptionTable({ items, onChange, onPrint }: PrescriptionTableProps) {
  const addItem = () => {
    const newItem: PrescriptionMedicine = {
      id: Math.random().toString(36).substring(2, 9),
      drugName: '',
      dose: '',
      frequency: '',
      duration: '',
      instructions: '',
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof PrescriptionMedicine, value: string) => {
    onChange(
      items.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((it) => it.id !== id));
  };

  const addQuickDrug = (drug: Omit<PrescriptionMedicine, 'id'>) => {
    const newItem: PrescriptionMedicine = {
      ...drug,
      id: Math.random().toString(36).substring(2, 9),
    };
    onChange([...items, newItem]);
  };

  return (
    <div className="space-y-4">
      {/* رأس قسم الروشتة والأدوية السريعة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-[#0040D8]" />
          <h4 className="font-black text-sm text-[#0A164E]">
            العلاج والروشتة الطبية (Rx)
          </h4>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0040D8] text-xs font-bold">
            {items.length} أصناف
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>طباعة الروشتة</span>
            </button>
          )}

          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة دواء جديد</span>
          </button>
        </div>
      </div>

      {/* اختصارات أدوية الأنف والأذن والحنجرة الأكثر شيوعاً */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>أدوية سريعة شائعة بالعيادة (اضغط للإضافة الفورية):</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {COMMON_ENT_DRUGS.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => addQuickDrug(d)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-[11px] font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              + {d.drugName}
            </button>
          ))}
        </div>
      </div>

      {/* جدول الأدوية */}
      {items.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs font-medium">
          لم يتم إضافة أي أدوية بعد. اضغط على «إضافة دواء جديد» أو اختر من الأدوية السريعة أعلاه.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-black">
                <th className="py-2.5 px-3 text-start w-10">#</th>
                <th className="py-2.5 px-3 text-start min-w-[180px]">اسم الدواء (Drug Name)</th>
                <th className="py-2.5 px-3 text-start min-w-[110px]">الجرعة (Dose)</th>
                <th className="py-2.5 px-3 text-start min-w-[120px]">التكرار (Frequency)</th>
                <th className="py-2.5 px-3 text-start min-w-[90px]">المدة (Duration)</th>
                <th className="py-2.5 px-3 text-start min-w-[160px]">ملاحظات وتعليمات</th>
                <th className="py-2.5 px-3 text-center w-12">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-mono font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      placeholder="e.g. Augmentin 1gm"
                      value={item.drugName}
                      onChange={(e) => updateItem(item.id, 'drugName', e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-bold text-[#0A164E] focus:outline-none focus:border-[#0040D8]"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      placeholder="e.g. 1 قرص"
                      value={item.dose}
                      onChange={(e) => updateItem(item.id, 'dose', e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0040D8]"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      placeholder="e.g. كل 12 ساعة"
                      value={item.frequency}
                      onChange={(e) => updateItem(item.id, 'frequency', e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0040D8]"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      placeholder="e.g. 7 أيام"
                      value={item.duration}
                      onChange={(e) => updateItem(item.id, 'duration', e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0040D8]"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      placeholder="e.g. بعد الأكل"
                      value={item.instructions || ''}
                      onChange={(e) => updateItem(item.id, 'instructions', e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0040D8]"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

