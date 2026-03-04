import { z } from "zod";

export const createOfferSchema = z.object({
    price: z.number().int().positive("Price must be a positive integer"),
    terms: z.string().optional(),
    expiresInDays: z.number().int().positive().default(7) // default 7 days validity
});
