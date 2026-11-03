'use client';

import React, { useRef, useState } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { BookingFormType, StagedAttachment } from '../types/booking';
import { Upload, X, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { fileToBase64, uploadAttachmentsApi } from '../services/attachments.service';
import { toast } from 'sonner';

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * القسم 5: مرفقات وملاحظات
 * - رفع صور الروشتات أو الفحوصات الطبية مع دعم السحب والإفلات
 * - رفع تلقائي فوري للخادم مع إظهار حالة الرفع (Uploading / Done)
 * - حقل ملاحظات إضافية للطبيب أو الاستقبال
 */
export function AttachmentsNotesStepCard() {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<BookingFormType>();

  const attachments = (useWatch({ control, name: 'attachments' }) || []) as StagedAttachment[];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // معالجة اختيار الملفات ورفعها فورياً في الخلفية
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (attachments.length + fileArray.length > MAX_ATTACHMENTS) {
      toast.error(`الحد الأقصى المسموح به هو ${MAX_ATTACHMENTS} صور فقط.`);
    }

    const availableSlots = MAX_ATTACHMENTS - attachments.length;
    const filesToProcess = fileArray.slice(0, availableSlots);

    const newStagedList: StagedAttachment[] = [];

    for (const file of filesToProcess) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`الملف ${file.name} غير مدعوم. الصيغ المدعومة هي: JPG, PNG, WebP.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`حجم الملف ${file.name} يتجاوز 5 ميجابايت.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const tempId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      newStagedList.push({
        id: tempId,
        file,
        previewUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        isUploading: true,
      });
    }

    if (newStagedList.length === 0) return;

    // إضافة الصور المبدئية في الواجهة فوراً مع علامة جاري الرفع
    const currentList = [...attachments, ...newStagedList];
    setValue('attachments', currentList, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // البدء برفع كل صورة على الخادم
    for (const staged of newStagedList) {
      if (!staged.file) continue;

      try {
        const base64Data = await fileToBase64(staged.file);
        const uploadedResult = await uploadAttachmentsApi([
          { name: staged.name, data: base64Data },
        ]);

        const uploadedMeta = uploadedResult[0];

        if (uploadedMeta) {
          // تحديث بيانات الصورة بمعلومات السيرفر (URL, ID)
          const currentList = (getValues('attachments') || []) as StagedAttachment[];
          const updatedList = currentList.map((item) =>
            item.id === staged.id
              ? {
                  ...item,
                  id: uploadedMeta.id,
                  url: uploadedMeta.url,
                  isUploading: false,
                }
              : item
          );
          setValue('attachments', updatedList, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      } catch (err: any) {
        toast.error(`فشل رفع ${staged.name}: ${err.message || 'خطأ في الخادم'}`);
        const currentList = (getValues('attachments') || []) as StagedAttachment[];
        const updatedList = currentList.map((item) =>
          item.id === staged.id
            ? {
                ...item,
                isUploading: false,
                uploadError: 'فشل الرفع',
              }
            : item
        );
        setValue('attachments', updatedList, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    const target = attachments[indexToRemove];
    if (target?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(target.previewUrl);
    }

    const updated = attachments.filter((_, idx) => idx !== indexToRemove);
    setValue('attachments', updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-100 space-y-5 animate-in fade-in-50">
      {/* رأس القسم: الرقم 5 والعنوان وعداد الصور */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3.5">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-black text-sm shrink-0">
            5
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#0A164E] tracking-tight">
              مرفقات وملاحظات
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              اختياري
            </p>
          </div>
        </div>

        {/* شارة عداد الصور */}
        <div className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs font-black shrink-0 font-mono">
          {attachments.length} / {MAX_ATTACHMENTS}
        </div>
      </div>

      {/* منطقة رفع الصور بالسحب والإفلات */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
          }
        }}
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all space-y-1.5 select-none ${
          isDragging
            ? 'border-[#1D4ED8] bg-blue-50/80 scale-[1.01]'
            : 'border-blue-200/80 bg-blue-50/20 hover:bg-blue-50/50 hover:border-blue-400'
        }`}
      >
        <div className="size-10 rounded-full bg-blue-50 text-[#0040D8] flex items-center justify-center mx-auto mb-1">
          <Upload className="size-5" />
        </div>
        <p className="text-xs sm:text-sm font-black text-[#0040D8]">
          اضغط لرفع الصور أو اسحبها هنا
        </p>
        <p className="text-2xs sm:text-xs text-slate-400 font-medium">
          حتى 5 صور (5MB لكل صورة)
        </p>
      </div>

      {/* معاينة الصور المرفوعة */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {attachments.map((att, idx) => (
            <div
              key={att.id || idx}
              className="relative group rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs"
            >
              <div className="aspect-video w-full flex items-center justify-center bg-slate-100 overflow-hidden relative">
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />

                {/* طبقة حالة الرفع */}
                {att.isUploading && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex flex-col items-center justify-center text-white gap-1">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span className="text-[10px] font-bold">جاري الرفع...</span>
                  </div>
                )}

                {/* شارة اكتمال الرفع بنجاح */}
                {att.url && !att.isUploading && (
                  <div className="absolute top-1 start-1 px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-white text-[9px] font-black flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                    <span>تم الرفع</span>
                  </div>
                )}

                {/* شارة الخطأ */}
                {att.uploadError && !att.isUploading && (
                  <div className="absolute top-1 start-1 px-1.5 py-0.5 rounded-md bg-rose-500/90 text-white text-[9px] font-black flex items-center gap-1 shadow-xs">
                    <AlertCircle className="w-3 h-3 stroke-[3]" />
                    <span>فشل الرفع</span>
                  </div>
                )}
              </div>

              <div className="p-1.5 bg-white text-[10px] font-bold text-slate-600 truncate border-t border-slate-100 flex items-center justify-between">
                <span className="truncate max-w-[120px]">{att.name}</span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {(att.size / 1024).toFixed(0)} KB
                </span>
              </div>

              {/* زر حذف الصورة */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveAttachment(idx);
                }}
                className="absolute top-1 end-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs opacity-90 hover:opacity-100 transition-opacity cursor-pointer z-10"
                title="حذف الصورة"
              >
                <X className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* حقل الملاحظات */}
      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            rows={3}
            placeholder="ملاحظات للطبيب أو الاستقبال..."
            className="w-full p-3.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-blue-600/10 transition-all resize-none"
          />
        )}
      />

      {errors.attachments && (
        <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errors.attachments.message}</span>
        </p>
      )}
    </div>
  );
}
