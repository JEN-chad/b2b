import { db } from "@b2b/db";
import { offers, listings, dealRooms, dealTasks, auditLogs } from "@b2b/db";
import { eq, and } from "drizzle-orm";

export class SellerService {
    static async respondToOffer(sellerId: string, offerId: string, status: "ACCEPTED" | "REJECTED" | "COUNTERED", ipAddress?: string) {
        const defaultIp = "127.0.0.1";
        return await db.transaction(async (tx) => {
            // 1. Fetch the offer and ensure it exists
            const offer = await tx.query.offers.findFirst({
                where: eq(offers.id, offerId),
                with: {
                    listing: true, // we need the sellerId to authorize
                }
            });

            if (!offer) {
                throw new Error("Offer not found");
            }

            if (offer.listing.sellerId !== sellerId) {
                throw new Error("Unauthorized to respond to this offer");
            }

            if (offer.status !== "PENDING" && offer.status !== "COUNTERED") {
                throw new Error(`Cannot respond to an offer with status ${offer.status}`);
            }

            // If ACCEPTED, check for any other ACCEPTED offers (Lock buyer & seller from parallel conflicting offers)
            if (status === "ACCEPTED") {
                const existingAccepted = await tx.query.offers.findFirst({
                    where: and(
                        eq(offers.listingId, offer.listingId),
                        eq(offers.status, "ACCEPTED")
                    ),
                });

                if (existingAccepted) {
                    throw new Error("An offer has already been accepted for this listing");
                }
            }

            // 2. Update the offer status
            const [updatedOffer] = await tx
                .update(offers)
                .set({ status, updatedAt: new Date() })
                .where(eq(offers.id, offerId))
                .returning();

            // 3. If accepted, auto-create a Deal Room and default tasks (Phase 7)
            let newDealRoom = null;
            if (status === "ACCEPTED") {
                const [insertedRoom] = await tx
                    .insert(dealRooms)
                    .values({
                        listingId: offer.listingId,
                        buyerId: offer.buyerId,
                        sellerId: sellerId,
                        status: "INITIATED",
                    })
                    .returning();

                newDealRoom = insertedRoom;

                // Create default checklist tasks for the deal room
                const defaultTasks = [
                    { title: "Deposit escrow funds", assignedTo: "BUYER" as const },
                    { title: "Provide asset access credentials", assignedTo: "SELLER" as const },
                    { title: "Complete due diligence review", assignedTo: "BUYER" as const },
                    { title: "Sign transfer agreement", assignedTo: "SELLER" as const },
                    { title: "Transfer asset ownership", assignedTo: "SELLER" as const },
                    { title: "Update DNS / domain records", assignedTo: "SELLER" as const },
                    { title: "Confirm asset receipt", assignedTo: "BUYER" as const },
                ];

                await tx.insert(dealTasks).values(
                    defaultTasks.map((task) => ({
                        dealRoomId: insertedRoom.id,
                        title: task.title,
                        assignedTo: task.assignedTo,
                    }))
                );
            }

            // 4. Audit Log
            await tx.insert(auditLogs).values({
                userId: sellerId,
                action: "OFFER_RESPONDED",
                entityType: "OFFER",
                entityId: updatedOffer.id,
                ipAddress: ipAddress || defaultIp,
                metadata: { newStatus: status },
            });

            return { offer: updatedOffer, dealRoom: newDealRoom };
        });
    }

    static async publishListing(sellerId: string, listingId: string, ipAddress?: string) {
        const defaultIp = "127.0.0.1";
        return await db.transaction(async (tx) => {
            const listing = await tx.query.listings.findFirst({
                where: eq(listings.id, listingId),
            });

            if (!listing) {
                throw new Error("Listing not found");
            }

            if (listing.sellerId !== sellerId) {
                throw new Error("Unauthorized to publish this listing");
            }

            if (listing.status !== "APPROVED") {
                throw new Error(`Cannot publish a listing with status ${listing.status}. Listing must be APPROVED first.`);
            }

            const [updatedListing] = await tx
                .update(listings)
                .set({ status: "LIVE", updatedAt: new Date() })
                .where(eq(listings.id, listingId))
                .returning();

            await tx.insert(auditLogs).values({
                userId: sellerId,
                action: "LISTING_PUBLISHED",
                entityType: "LISTING",
                entityId: updatedListing.id,
                ipAddress: ipAddress || defaultIp,
                metadata: { previousStatus: "APPROVED", newStatus: "LIVE" },
            });

            return updatedListing;
        });
    }
}
