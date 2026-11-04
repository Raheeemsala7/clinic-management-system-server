"use client";

import { searchPatients } from "@/features/patient/services/patients.service";
import { getDoctorsList, getDoctorAvailableSlots } from "../services/doctors.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CreateAppointmentPayload } from "../types/booking";
import {
  createQuickPatientAction,
  admitAppointmentAction,
  finishExamAppointmentAction,
  checkoutAppointmentAction,
  postponeAppointmentAction,
  cancelAppointmentAction,
} from "../apis/appointment.action";
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

export const queueKeys = {
    all: ["queue"] as const,
    today: (doctorId?: string) =>
        [...queueKeys.all, "today", doctorId || "all"] as const,
};

export const appointmentKeys = {
    all: ["appointments"] as const,
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
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (payload: CreateAppointmentPayload) => {
            const res = await createQuickPatientAction(payload);

            if (res.code === 401) {
                await signOut({ callbackUrl: "/auth/login?expired=true" });
                throw new Error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
            }

            if (!res.status) {
                throw new Error(res.message || "فشل تسجيل الموعد");
            }

            return res;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
            queryClient.invalidateQueries({ queryKey: doctorKeys.all });
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            toast.success(data.message || "تم تسجيل الموعد بنجاح");
            router.refresh();
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });
}

/**
 * هوك React Query لإدخال المريض لغرفة الكشف (Admit)
 */
export function useAdmitAppointmentMutation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (appointmentId: string) => {
            const res = await admitAppointmentAction(appointmentId);
            if (res.code === 401) {
                await signOut({ callbackUrl: "/auth/login?expired=true" });
                throw new Error("انتهت صلاحية الجلسة");
            }
            if (!res.status) {
                throw new Error(res.message || "فشل إدخال المريض");
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
            queryClient.invalidateQueries({ queryKey: doctorKeys.all });
            toast.success("تم إدخال المريض لغرفة الكشف");
            router.refresh();
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });
}

/**
 * هوك React Query لإنهاء الكشف من جانب الطبيب (Finish Exam -> Pending Checkout)
 */
export function useFinishExamAppointmentMutation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (appointmentId: string) => {
            const res = await finishExamAppointmentAction(appointmentId);
            if (res.code === 401) {
                await signOut({ callbackUrl: "/auth/login?expired=true" });
                throw new Error("انتهت صلاحية الجلسة");
            }
            if (!res.status) {
                throw new Error(res.message || "فشل إنهاء الكشف");
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
            toast.info("انتهى كشف المريض، وأصبح بانتظار المحاسبة بالاستقبال");
            router.refresh();
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });
}

/**
 * هوك React Query لتسوية الحساب وإنهاء الزيارة وخروج المريض (Checkout & Settle)
 */
export function useCheckoutAppointmentMutation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async ({
            id,
            payload,
        }: {
            id: string;
            payload?: { method?: "CASH" | "CARD" | "WALLET"; amount?: number; notes?: string };
        }) => {
            const res = await checkoutAppointmentAction(id, payload);
            if (res.code === 401) {
                await signOut({ callbackUrl: "/auth/login?expired=true" });
                throw new Error("انتهت صلاحية الجلسة");
            }
            if (!res.status) {
                throw new Error(res.message || "فشل إنهاء الزيارة وتسوية الحساب");
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
            queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            toast.success("تم تسوية الحساب وإنهاء الزيارة بنجاح");
            router.refresh();
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });
}

/**
 * هوك React Query لتأجيل دور المريض
 */
export function usePostponeAppointmentMutation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (appointmentId: string) => {
            const res = await postponeAppointmentAction(appointmentId);
            if (res.code === 401) {
                await signOut({ callbackUrl: "/auth/login?expired=true" });
                throw new Error("انتهت صلاحية الجلسة");
            }
            if (!res.status) {
                throw new Error(res.message || "فشل تأجيل الموعد");
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
            toast.info("تم تأجيل دور المريض في قائمة الانتظار");
            router.refresh();
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });
}

/**
 * هوك React Query لإلغاء الموعد
 */
export function useCancelAppointmentMutation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (appointmentId: string) => {
            const res = await cancelAppointmentAction(appointmentId);
            if (res.code === 401) {
                await signOut({ callbackUrl: "/auth/login?expired=true" });
                throw new Error("انتهت صلاحية الجلسة");
            }
            if (!res.status) {
                throw new Error(res.message || "فشل إلغاء الموعد");
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queueKeys.all });
            toast.error("تم إلغاء الموعد");
            router.refresh();
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });
}