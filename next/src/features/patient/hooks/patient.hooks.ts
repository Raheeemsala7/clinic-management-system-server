"use client"

import { useMutation } from "@tanstack/react-query";
import { createNewPatientAction } from "../apis/patient.action";
import { PatientPayload } from "../types/patient";
import { toast } from "sonner";

export function useCreatePatientMutation() {
  return useMutation({
    mutationFn: async ({ fullName, address, age, chronicConditions, gender, phone }: PatientPayload) => {
      const result = await createNewPatientAction({ address, age, chronicConditions, fullName, gender, phone });

      if (!result.status) {
        throw new Error(result.message);
      }

      return result.payload;
    },

    onSuccess: (data) => {
      toast.success("Patient created successfully")
    },

    onError: (error) => {
      console.error("Create patient error:", error);
      toast.error(error.message || "Something went wrong    ")
    },
  });
}