import { z } from "zod";

export const submitKycSchema = z.object({
    panNumber: z.string().min(10).max(10),
    aadhaarMasked: z.string().optional(),
    companyPan: z.string().optional(),
    cinOrLlpin: z.string().optional(),
    gstNumber: z.string().optional(),
});

export const reviewKycSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED", "UNDER_REVIEW"]),
    rejectionReason: z.string().optional().refine((val) => {
        // We handle cross-field validation logic more explicitly in the controller/service
        return true;
    }),
});
