"use client"

import { useMutation } from "@tanstack/react-query";
import { createNewPatientAction } from "../apis/patient.action";
import { PatientPayload } from "../types/patient";
import { toast } from "sonner";

export function useCreatePatientMutation() {
  return useMutation({
    mutationFn: async (payload: PatientPayload) => {
      const result = await createNewPatientAction(payload);

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