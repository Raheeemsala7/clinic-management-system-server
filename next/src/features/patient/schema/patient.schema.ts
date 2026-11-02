import z from "zod";

export const quickPatientSchema = (t?: any) =>
    z.object({
          fullName: z
            .string()
            .trim()
            .min(1, 'اسم المريض مطلوب')
            .refine(
              (val) => val.trim().split(/\s+/).filter(Boolean).length >= 4,
              'يجب إدخال اسم المريض رباعياً على الأقل (أربعة مقاطع)'
            ),
          phone: z
            .string()
            .trim()
            .min(10, 'يرجى إدخال رقم هاتف صحيح لا يقل عن 10 أرقام'),
          age: z
            .number({ error: 'السن مطلوب ويجب أن يكون رقماً' })
            .min(1, 'السن يجب أن يكون سنة واحدة على الأقل')
            .max(120, 'السن يجب ألا يتجاوز 120 سنة'),
          gender: z.enum(['MALE', 'FEMALE'], {
            message: 'يرجى تحديد النوع',
          }),
          hasChronicDisease: z.boolean(),
          chronicDiseases: z.array(z.string()),
    })
    .refine(
        (data) => {
            if (data.hasChronicDisease) {
                return Array.isArray(data.chronicDiseases) && data.chronicDiseases.length > 0;
            }
            return true;
        },
        {
            message: 'يرجى اختيار مرض مزمن واحد على الأقل',
            path: ['chronicDiseases'],
        }
    );
