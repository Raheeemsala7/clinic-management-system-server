"use client"

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useSearchPatients } from "../hooks/appointments.hook";
import { Loader2, Search } from "lucide-react";
import { BookingFormType, PatientBasic } from "../types/booking";
import { useFormContext } from "react-hook-form";

export function SearchPatientInput({}) {
    const [searchQuery, setSearchQuery] = useState("");

    const {
        setValue,
    } = useFormContext<BookingFormType>();

    const [debouncedSearchQuery] = useDebounce(
        searchQuery.trim(),
        300,
    );

    const {
        data: searchResults = [],
        isFetching: isSearching,
        isError: isSearchError,
    } = useSearchPatients(debouncedSearchQuery);


    const shouldShowSearchResults =
        searchQuery.trim().length >= 2;
    const isDebouncing =
        searchQuery.trim() !== debouncedSearchQuery;


    // 2. اختيار مريض من نتائج البحث وتحديث النموذج وملخص الحجز فوراً
    const handleSelectPatient = (patient: PatientBasic) => {
        setValue('patientId', patient.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        setValue('patientName', patient.fullName || patient.name || '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        setValue('patientPhone', patient.phone, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        if (patient.gender) {
            setValue('patientGender', patient.gender, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        }
        if (patient.age !== undefined && patient.age !== null) {
            setValue('patientAge', patient.age, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        }
        if (patient.chronicConditions && patient.chronicConditions.length > 0) {
            setValue('hasChronicDisease', true, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue('chronicDiseases', patient.chronicConditions, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

        }
    };
    return (
        <div className="relative flex-1">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو رقم الهاتف أو المعرف..."
                className="w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-600/10 transition-all"
            />

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                {isSearching || isDebouncing ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                ) : (
                    <Search className="w-4 h-4 text-slate-400" />
                )}
            </div>

            {/* Search Results */}
            {searchQuery.trim().length > 0 && (
                <div className="absolute top-full mt-1.5 inset-x-0 bg-white rounded-2xl shadow-xl border border-slate-200/80 z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50">

                    {/* أقل من حرفين */}
                    {!shouldShowSearchResults ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                            اكتب حرفين على الأقل للبحث.
                        </div>
                    ) : isDebouncing || isSearching ? (
                        /* Loading */
                        <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                            <span>جاري البحث في قاعدة البيانات...</span>
                        </div>
                    ) : isSearchError ? (
                        /* Error */
                        <div className="p-4 text-center text-xs text-rose-500">
                            حدث خطأ أثناء البحث. حاول مرة أخرى.
                        </div>
                    ) : searchResults.length === 0 ? (
                        /* Empty State */
                        <div className="p-4 text-center text-xs text-slate-400">
                            لم يتم العثور على مريض بهذا الاسم. يمكنك الضغط على
                            &quot;+ مريض جديد&quot;.
                        </div>
                    ) : (
                        /* Results */
                        searchResults.map((patient) => (
                            <button
                                key={patient.id}
                                type="button"
                                onClick={() => {
                                    handleSelectPatient(patient);
                                    setSearchQuery("");
                                }}
                                className="w-full p-3.5 hover:bg-blue-50/60 transition-colors cursor-pointer flex items-center justify-between text-start"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#0A164E] text-white flex items-center justify-center font-bold text-xs">
                                        {(patient.name || patient.fullName || "م").charAt(0)}
                                    </div>

                                    <div>
                                        <p className="font-bold text-xs text-[#0A164E]">
                                            {patient.name || patient.fullName}
                                        </p>

                                        <p className="text-[11px] text-slate-400">
                                            {patient.phone}
                                            {patient.age ? ` · السن: ${patient.age} سنة` : ""}
                                            {patient.gender
                                                ? ` · ${patient.gender === "FEMALE" ? "أنثى" : "ذكر"}`
                                                : ""}
                                            {patient.lastVisit
                                                ? ` · آخر زيارة: ${patient.lastVisit}`
                                                : ""}
                                        </p>
                                    </div>
                                </div>

                                <span className="text-xs font-bold text-[#1D4ED8]">
                                    اختيار
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
