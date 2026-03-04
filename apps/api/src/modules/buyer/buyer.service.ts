import { db } from "@b2b/db";
import { listings, ndas, offers, unlockRecords, auditLogs } from "@b2b/db";
import { eq, and } from "drizzle-orm";

export class BuyerService {
    static async signNDA(buyerId: string, listingId: string, ipAddress?: string) {
        const defaultIp = "127.0.0.1";
        return await db.transaction(async (tx) => {
            // Check if listing exists
            const listing = await tx.query.listings.findFirst({
                where: eq(listings.id, listingId),
            });

            if (!listing) {
                throw new Error("Listing not found");
            }

            // Check if already signed
            const existingNDA = await tx.query.ndas.findFirst({
                where: and(eq(ndas.buyerId, buyerId), eq(ndas.listingId, listingId)),
            });

            if (existingNDA) {
                throw new Error("NDA already signed for this listing");
            }

            const [newNda] = await tx
                .insert(ndas)
                .values({
                    buyerId,
                    listingId,
                })
                .returning();

            await tx.insert(auditLogs).values({
                userId: buyerId,
                action: "NDA_SIGNED",
                entityType: "NDA",
                entityId: newNda.id,
                ipAddress: ipAddress || defaultIp,
            });

            return newNda;
        });
    }

    static async unlockListing(buyerId: string, listingId: string, ipAddress?: string) {
        const defaultIp = "127.0.0.1";
        return await db.transaction(async (tx) => {
            const listing = await tx.query.listings.findFirst({
                where: eq(listings.id, listingId),
            });

            if (!listing) {
                throw new Error("Listing not found");
            }

            // If NDA is required, check if signed
            if (listing.ndaRequired) {
                const existingNDA = await tx.query.ndas.findFirst({
                    where: and(eq(ndas.buyerId, buyerId), eq(ndas.listingId, listingId)),
                });

                if (!existingNDA) {
                    throw new Error("NDA signature required before unlocking this listing");
                }
            }

            // Check if already unlocked
            const existingUnlock = await tx.query.unlockRecords.findFirst({
                where: and(eq(unlockRecords.buyerId, buyerId), eq(unlockRecords.listingId, listingId)),
            });

            if (existingUnlock) {
                throw new Error("Listing already unlocked");
            }

            const [unlockRecord] = await tx
                .insert(unlockRecords)
                .values({
                    buyerId,
                    listingId,
                })
                .returning();

            await tx.insert(auditLogs).values({
                userId: buyerId,
                action: "LISTING_UNLOCKED",
                entityType: "UNLOCK_RECORD",
                entityId: unlockRecord.id,
                ipAddress: ipAddress || defaultIp,
            });

            return unlockRecord;
        });
    }

    static async createOffer(
        buyerId: string,
        listingId: string,
        data: { price: number; terms?: string; expiresInDays: number },
        ipAddress?: string
    ) {
        const defaultIp = "127.0.0.1";
        return await db.transaction(async (tx) => {
            const listing = await tx.query.listings.findFirst({
                where: eq(listings.id, listingId),
            });

            if (!listing) {
                throw new Error("Listing not found");
            }

            if (listing.status !== "LIVE") {
                throw new Error(`Cannot make an offer on a listing with status ${listing.status}`);
            }

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);

            const [newOffer] = await tx
                .insert(offers)
                .values({
                    buyerId,
                    listingId,
                    price: data.price,
                    terms: data.terms,
                    expiresAt,
                    status: "PENDING",
                })
                .returning();

            await tx.insert(auditLogs).values({
                userId: buyerId,
                action: "OFFER_CREATED",
                entityType: "OFFER",
                entityId: newOffer.id,
                ipAddress: ipAddress || defaultIp,
                metadata: { price: data.price, terms: data.terms },
            });

            return newOffer;
        });
    }
}
