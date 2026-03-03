import { z } from "zod";
import { assetTypeEnum, listingVisibilityEnum } from "@b2b/db";

// Use strings that match the DB enums
export const createListingSchema = z.object({
  title: z.string().min(3).max(100),
  assetType: z.enum(["SAAS", "ECOMMERCE", "BLOG", "APP", "DOMAIN"]),
  industry: z.string().min(2),
  revenueMonthly: z.number().min(0).default(0),
  profitMonthly: z.number().min(0).default(0),
  askingPrice: z.number().min(1),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE"),
  ndaRequired: z.boolean().default(false),
});

export const updateListingSchema = createListingSchema.partial();
