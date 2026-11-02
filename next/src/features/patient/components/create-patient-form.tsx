"use client"
import { Controller, Form, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quickPatientSchema } from "../schema/patient.schema";
import { useTranslations } from "next-intl";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";
import { useCreatePatientMutation } from "../hooks/patient.hooks";
import { QuickPatientFormValues } from "../types/patient";
import { CHRONIC_DISEASES } from "@/features/appointments/constants/booking.constant";
import { BookingFormType } from "@/features/appointments";

export function CreatePatientForm({ setIsQuickAddOpen }: { setIsQuickAddOpen: (val: boolean) => void }) {
    const t = useTranslations()
    const {
        setValue: setValueBoking,
    } = useFormContext<BookingFormType>();

    const {
        control: quickControl,
        handleSubmit: handleQuickSubmit,
        setValue,
        reset: resetQuick,
        watch,
        formState: { errors: quickErrors, isSubmitting: isCreatingPatient },
    } = useForm<QuickPatientFormValues>({
        resolver: zodResolver(quickPatientSchema(t)),
        defaultValues: {
            fullName: '',
            phone: '',
            age: 30,
            gender: 'MALE',
            hasChronicDisease: false,
            chronicDiseases: [],
        },
        mode: 'all',
    });

    const hasChronicDisease = watch('hasChronicDisease');
    const selectedDiseases = watch('chronicDiseases') || [];

    const handleToggleDisease = (diseaseId: string) => {
        const next = selectedDiseases.includes(diseaseId)
            ? selectedDiseases.filter((id: string) => id !== diseaseId)
            : [...selectedDiseases, diseaseId];
        setValue('chronicDiseases', next, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    };

    const { mutateAsync: createPatientMutation, isPending: isCreateMutation } = useCreatePatientMutation()




    const onQuickAddSubmit = async (values: QuickPatientFormValues) => {



        try {
            // await createPatientMutation({fullName: values.fullName, phone: values.phone, age: values.age, gender: values.gender, chronicConditions: values.hasChronicDisease ? values.chronicDiseases : [], generalNotes: values.generalNotes})
            const data = await createPatientMutation({
                fullName: values.fullName,
                phone: values.phone,
                age: values.age,
                gender: values.gender,
                chronicConditions: values.hasChronicDisease ? values.chronicDiseases : [],
            });
            setValueBoking("patientId", data.id)
            setValueBoking("patientName", data.fullName)
            setValueBoking("patientAge", data.age)
            setValueBoking("patientGender", data.gender)
            setValueBoking("patientPhone", data.phone)
            setValueBoking("hasChronicDisease", hasChronicDisease )
            setValueBoking("chronicDiseases", selectedDiseases )

            resetQuick();
            setIsQuickAddOpen(false);


        } catch {
            toast.error('تعذر تسجيل المريض، يرجى المحاولة مرة أخرى.');
        }
    };

    const submitQuickPatient = handleQuickSubmit(onQuickAddSubmit);

    return (
        <div>
            <div className="space-y-3">
                {/* 1. اسم المريض رباعياً عبر Controller */}
                <Controller
                    name="fullName"
                    control={quickControl}
                    render={({ field }) => (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                اسم المريض رباعياً <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="مثال: أحمد محمد علي حسن"
                                className={cn(
                                    'w-full h-10 px-3.5 rounded-xl border bg-white text-xs placeholder:text-slate-400 focus:outline-none transition-all',
                                    quickErrors.fullName
                                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                                        : 'border-slate-200 focus:border-[#1D4ED8] focus:ring-2 focus:ring-blue-600/10'
                                )}
                                {...field}
                            />
                            {quickErrors.fullName ? (
                                <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{quickErrors.fullName.message}</span>
                                </p>
                            ) : (
                                <p className="text-[10px] text-slate-400 mt-1">يجب إدخال أربعة مقاطع للاسم على الأقل</p>
                            )}
                        </div>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 2. رقم الهاتف عبر Controller */}
                    <Controller
                        name="phone"
                        control={quickControl}
                        render={({ field }) => (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    رقم الهاتف <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="01012345678"
                                    dir="ltr"
                                    className={cn(
                                        'w-full h-10 px-3.5 rounded-xl border bg-white text-xs placeholder:text-slate-400 focus:outline-none transition-all text-start',
                                        quickErrors.phone
                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                                            : 'border-slate-200 focus:border-[#1D4ED8] focus:ring-2 focus:ring-blue-600/10'
                                    )}
                                    {...field}
                                />
                                {quickErrors.phone && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{quickErrors.phone.message}</span>
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    {/* 3. السن عبر Controller */}
                    <Controller
                        name="age"
                        control={quickControl}
                        render={({ field }) => (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    السن (بالسنوات) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    placeholder="مثال: 32"
                                    className={cn(
                                        'w-full h-10 px-3.5 rounded-xl border bg-white text-xs placeholder:text-slate-400 focus:outline-none transition-all',
                                        quickErrors.age
                                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                                            : 'border-slate-200 focus:border-[#1D4ED8] focus:ring-2 focus:ring-blue-600/10'
                                    )}
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                />
                                {quickErrors.age && (
                                    <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{quickErrors.age.message}</span>
                                    </p>
                                )}
                            </div>
                        )}
                    />
                </div>

                {/* 4. النوع (ذكر / أنثى) عبر Controller */}
                <Controller
                    name="gender"
                    control={quickControl}
                    render={({ field }) => (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                النوع <span className="text-rose-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => field.onChange('MALE')}
                                    className={cn(
                                        'h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer',
                                        field.value === 'MALE'
                                            ? 'bg-[#0A164E] text-white border-[#0A164E] shadow-xs'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    )}
                                >
                                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                                    <span>ذكر</span>
                                    {field.value === 'MALE' && <Check className="w-3.5 h-3.5" />}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => field.onChange('FEMALE')}
                                    className={cn(
                                        'h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer',
                                        field.value === 'FEMALE'
                                            ? 'bg-[#0A164E] text-white border-[#0A164E] shadow-xs'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    )}
                                >
                                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                                    <span>أنثى</span>
                                    {field.value === 'FEMALE' && <Check className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                            {quickErrors.gender && (
                                <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{quickErrors.gender.message}</span>
                                </p>
                            )}
                        </div>
                    )}
                />


            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF0] border border-amber-300 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="font-bold text-xs sm:text-sm text-slate-800">
                        هل يعاني المريض من مرض مزمن؟ <span className="text-amber-600">*</span>
                    </span>

                    <div className="inline-flex items-center p-1 bg-white rounded-xl border border-slate-200">
                        <button
                            type="button"
                            onClick={() => setValue('hasChronicDisease', true, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                            className={cn(
                                'px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                                hasChronicDisease
                                    ? 'bg-[#0A164E] text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            )}
                        >
                            نعم
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setValue('hasChronicDisease', false, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                                setValue('chronicDiseases', [], { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                            }}
                            className={cn(
                                'px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                                !hasChronicDisease
                                    ? 'bg-[#0A164E] text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            )}
                        >
                            لا
                        </button>
                    </div>
                </div>

                {hasChronicDisease && (
                    <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-in fade-in-50">
                        <div className="flex flex-wrap gap-2">
                            {CHRONIC_DISEASES.map((disease) => {
                                const isSelected = selectedDiseases.includes(disease.id);
                                return (
                                    <button
                                        key={disease.id}
                                        type="button"
                                        onClick={() => handleToggleDisease(disease.id)}
                                        className={cn(
                                            'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs',
                                            isSelected
                                                ? 'bg-brand-yellow text-slate-950 font-black shadow-xs ring-1 ring-amber-400'
                                                : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300'
                                        )}
                                    >
                                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                        <span>{disease.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {quickErrors.chronicDiseases && (
                            <p className="text-xs text-rose-500 font-semibold">{quickErrors.chronicDiseases.message}</p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2.5 pt-1 mt-4">
                <button
                    type="button"
                    onClick={() => void submitQuickPatient()}
                    disabled={isCreatingPatient || isCreateMutation}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-98 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-xs"
                >
                    {isCreatingPatient || isCreateMutation ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جاري حفظ المريض...</span>
                        </>
                    ) : (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            <span>حفظ واختيار المريض</span>
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        setIsQuickAddOpen(false);
                    }}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all cursor-pointer"
                >
                    إلغاء
                </button>
            </div>
        </div>
    );
}
