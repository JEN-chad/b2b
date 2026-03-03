import { db, listings, auditLogs } from "@b2b/db";
import { eq, and } from "drizzle-orm";

export class ListingService {
    static async createListing(sellerId: string, data: any) {
        return await db.transaction(async (tx) => {
            // Generate simple slug (e.g. title-12345)
            const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(Math.random() * 100000)}`;

            const [listing] = await tx.insert(listings).values({
                sellerId,
                title: data.title,
                slug,
                assetType: data.assetType,
                industry: data.industry,
                revenueMonthly: data.revenueMonthly,
                profitMonthly: data.profitMonthly,
                askingPrice: data.askingPrice,
                visibility: data.visibility,
                ndaRequired: data.ndaRequired,
                status: "DRAFT"
            }).returning();

            await tx.insert(auditLogs).values({
                action: "LISTING_CREATED",
                entityType: "LISTING",
                entityId: listing.id,
                userId: sellerId,
                metadata: { title: listing.title }
            });

            return listing;
        });
    }

    static async getListings() {
        return await db.select().from(listings);
    }

    static async getListingById(id: string) {
        const [listing] = await db.select().from(listings).where(eq(listings.id, id));
        return listing;
    }

    static async updateListing(id: string, sellerId: string, data: any) {
        return await db.transaction(async (tx) => {
             // Only the seller can update their listing
             const [existing] = await tx.select().from(listings).where(and(eq(listings.id, id), eq(listings.sellerId, sellerId)));
             
             if (!existing) {
                  throw new Error("Listing not found or unauthorized");
             }

             const [updated] = await tx.update(listings).set({
                 ...data,
                 updatedAt: new Date()
             }).where(eq(listings.id, id)).returning();

             await tx.insert(auditLogs).values({
                action: "LISTING_UPDATED",
                entityType: "LISTING",
                entityId: id,
                userId: sellerId,
             });

             return updated;
        });
    }

    static async submitListing(id: string, sellerId: string) {
        return await db.transaction(async (tx) => {
            const [existing] = await tx.select().from(listings).where(and(eq(listings.id, id), eq(listings.sellerId, sellerId)));
            if (!existing) throw new Error("Listing not found");
            if (existing.status !== "DRAFT" && existing.status !== "CHANGES_REQUESTED") {
                throw new Error("Can only submit DRAFT or CHANGES_REQUESTED listings");
            }

            const [updated] = await tx.update(listings).set({
                status: "UNDER_REVIEW",
                updatedAt: new Date()
            }).where(eq(listings.id, id)).returning();

            await tx.insert(auditLogs).values({
               action: "LISTING_SUBMITTED_FOR_REVIEW",
               entityType: "LISTING",
               entityId: id,
               userId: sellerId,
            });

            return updated;
       });
    }

    static async reviewListing(id: string, adminId: string, status: "APPROVED" | "CHANGES_REQUESTED" | "LIVE" | "LOCKED" | "SOLD") {
         return await db.transaction(async (tx) => {
            const [updated] = await tx.update(listings).set({
                status: status,
                updatedAt: new Date()
            }).where(eq(listings.id, id)).returning();

             if (!updated) throw new Error("Listing not found");

             await tx.insert(auditLogs).values({
               action: `LISTING_${status}`,
               entityType: "LISTING",
               entityId: id,
               userId: adminId,
            });

            return updated;
       });
    }
}
