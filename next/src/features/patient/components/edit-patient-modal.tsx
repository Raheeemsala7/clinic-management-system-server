'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { X, Edit3, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { updatePatientAction } from '../apis/patient.action';
import { Patient } from '../types/patient';
import { CHRONIC_DISEASES } from '@/features/appointments/constants/booking.constant';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess?: () => void;
}

export function EditPatientModal({ isOpen, onClose, patient, onSuccess }: EditPatientModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number | ''>(30);
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [address, setAddress] = useState('');
  const [hasChronic, setHasChronic] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (patient) {
      setFullName(patient.fullName || '');
      setPhone(patient.phone || '');
      setAge(patient.age || 30);
      setGender(patient.gender || 'MALE');
      setAddress(patient.address || '');
      const chronic = patient.chronicConditions || [];
      setSelectedDiseases(chronic);
      setHasChronic(chronic.length > 0);
      setFormError(null);
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const toggleDisease = (name: string) => {
    setSelectedDiseases((prev) =>
      prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 4) {
      setFormError('يجب إدخال اسم المريض رباعياً على الأقل (أربعة أسماء).');
      return;
    }

    const phoneClean = phone.trim();
    if (!/^01[0125][0-9]{8}$/.test(phoneClean)) {
      setFormError('رقم الهاتف غير صالح، يجب أن يبدأ بـ 01 ويتكون من 11 رقماً.');
      return;
    }

    if (!age || Number(age) <= 0 || Number(age) > 120) {
      setFormError('يرجى إدخال عمر صحيح بين 1 و 120 سنة.');
      return;
    }

    startTransition(async () => {
      const res = await updatePatientAction(patient.id, {
        fullName: fullName.trim(),
        phone: phoneClean,
        gender,
        age: Number(age),
        address: address.trim() || undefined,
        chronicConditions: hasChronic ? selectedDiseases : [],
      });

      if (res.status) {
        toast.success(`تم تحديث بيانات المريض (${fullName}) بنجاح`);
        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        setFormError(res.message || 'فشل تحديث بيانات المريض');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-start relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* رأس النافذة */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Edit3 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0A164E]">تعديل بيانات المريض</h3>
              <p className="text-xs text-slate-400">تحديث المعلومات الأساسية للمريض</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
          <div>
            <label className="block mb-1.5 text-slate-700">الاسم بالكامل (رباعي) *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-[#0A164E] font-bold focus:outline-none focus:border-[#0040D8] focus:ring-3 focus:ring-blue-600/10 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block mb-1.5 text-slate-700">رقم الهاتف *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-[#0A164E] font-mono font-bold focus:outline-none focus:border-[#0040D8] focus:ring-3 focus:ring-blue-600/10 transition-all"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-slate-700">العمر (بالسنوات) *</label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-[#0A164E] font-bold focus:outline-none focus:border-[#0040D8] focus:ring-3 focus:ring-blue-600/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block mb-1.5 text-slate-700">النوع *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('MALE')}
                  className={`h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    gender === 'MALE'
                      ? 'bg-blue-50 border-[#0040D8] text-[#0040D8]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ذكر
                </button>
                <button
                  type="button"
                  onClick={() => setGender('FEMALE')}
                  className={`h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    gender === 'FEMALE'
                      ? 'bg-pink-50 border-pink-500 text-pink-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  أنثى
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-slate-700">العنوان / المدينة</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: الزقازيق، الشرقية"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-[#0A164E] font-bold focus:outline-none focus:border-[#0040D8] focus:ring-3 focus:ring-blue-600/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-700 font-bold">هل يعاني من أمراض مزمنة؟</span>
              <button
                type="button"
                onClick={() => setHasChronic(!hasChronic)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hasChronic ? 'bg-[#0040D8]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    hasChronic ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {hasChronic && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {CHRONIC_DISEASES.map((disease) => {
                  const isSelected = selectedDiseases.includes(disease.label);
                  return (
                    <button
                      key={disease.id}
                      type="button"
                      onClick={() => toggleDisease(disease.label)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {disease.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-11 rounded-xl bg-[#0040D8] hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>حفظ التعديلات</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
