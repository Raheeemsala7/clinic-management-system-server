"use client"

import { searchPatients } from "@/features/patient/services/patients.service";
import { useQuery } from "@tanstack/react-query";



export const patientKeys = {
  all: ["patients"] as const,
  search: (query: string) =>
    [...patientKeys.all, "search", query] as const,
};

export function useSearchPatients(query: string) {
  return useQuery({
    queryKey: patientKeys.search(query),
    queryFn: ({ signal }) => searchPatients(query, signal),
    enabled: query.length >= 2,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}