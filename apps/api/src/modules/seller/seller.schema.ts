import { z } from "zod";

export const respondOfferSchema = z.object({
    status: z.enum(["ACCEPTED", "REJECTED", "COUNTERED"]),
});
