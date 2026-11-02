import { PatientBasic } from "@/features/appointments";


export async function searchPatients(
    query: string,
    signal?: AbortSignal,
): Promise<PatientBasic[]> {
    const params = new URLSearchParams({ q: query });

    const response = await fetch(
        `/api/patients/search?${params.toString()}`,
        {
            method: "GET",
            signal,
        },
    );

    if (!response.ok) {
        throw new Error("Failed to search patients");
    }

    const data: ApiResponse<PatientBasic[]> = await response.json();

    if (!data.status) {
        throw new Error(data.message || "Failed to search patients");
  }

    if (!Array.isArray(data.payload)) {
        throw new Error("Invalid patients response");
    }

    return data.payload as PatientBasic[];
}