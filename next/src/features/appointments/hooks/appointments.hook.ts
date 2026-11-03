"use client";

import { searchPatients } from "@/features/patient/services/patients.service";
import { getDoctorsList, getDoctorAvailableSlots } from "../services/doctors.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CreateAppointmentPayload } from "../types/booking";
import { createQuickPatientAction } from "../apis/appointment.action";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export const patientKeys = {
    all: ["patients"] as const,
    search: (query: string) =>
        [...patientKeys.all, "search", query] as const,
};

export const doctorKeys = {
    all: ["doctors"] as const,
    lists: () => [...doctorKeys.all, "list"] as const,
    slots: (doctorId: string, date: string) =>
        [...doctorKeys.all, "slots", doctorId, date] as const,
};

/**
 * هوك للبحث في قائمة المرضى
 */
export function useSearchPatients(query: string) {
    return useQuery({
        queryKey: patientKeys.search(query),
        queryFn: ({ signal }) => searchPatients(query, signal),
        enabled: query.length >= 2,
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error: any) => {
            if (error?.message?.includes("صلاحية") || error?.message?.includes("401")) {
                return false;
            }
            return failureCount < 1;
        },
    });
}

/**
 * هوك جلب الأطباء مع التخزين المؤقت الطويل (Cache)
 * نادراً ما تتغير قائمة الأطباء لذلك يتم عمل كاش لمدة 24 ساعة
 */
export function useDoctorsQuery() {
    return useQuery({
        queryKey: doctorKeys.lists(),
        queryFn: ({ signal }) => getDoctorsList(signal),
        staleTime: 1000 * 60 * 60 * 24, // 24 ساعة
        gcTime: 1000 * 60 * 60 * 24 * 7, // أسبوع
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: (failureCount, error: any) => {
            if (error?.message?.includes("صلاحية") || error?.message?.includes("401")) {
                return false;
            }
            return failureCount < 1;
        },
    });
}

/**
 * هوك جلب المواعيد المتاحة لدكتور محدد في تاريخ معين
 */
export function useDoctorAvailableSlotsQuery(doctorId?: string, date?: string) {
    return useQuery({
        queryKey: doctorKeys.slots(doctorId || "", date || ""),
        queryFn: ({ signal }) => getDoctorAvailableSlots(doctorId!, date!, signal),
        enabled: Boolean(doctorId && date),
        staleTime: 1000 * 60 * 2, // دقيقتان لتفادي الطلبات المتكررة مع الحفاظ على حداثة الحجوزات
        gcTime: 1000 * 60 * 10,
        retry: (failureCount, error: any) => {
            if (error?.message?.includes("صلاحية") || error?.message?.includes("401")) {
                return false;
            }
            return failureCount < 1;
        },
    });
}



export function useCreateAppointmentMutation() {
    return useMutation({
        mutationFn: async (payload: CreateAppointmentPayload) => {
            const res = await createQuickPatientAction(payload)

            if (!res.status) {
                throw new Error(res.message)
            }

            if (res.code === 401) {
                await signOut({ callbackUrl: "/auth/login?expired=true" });
                throw new Error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
            }

            return res
        },
        onSuccess: (data) => {
            toast.success(data.message)
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })
}