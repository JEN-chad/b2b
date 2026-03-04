import { Request, Response } from "express";
import { z } from "zod";
import { SellerService } from "./seller.service";
import { respondOfferSchema } from "./seller.schema";

export class SellerController {
    static async respondToOffer(req: Request, res: Response) {
        try {
            const sellerId = req.user?.userId;
            const offerId = req.params.id;

            if (!sellerId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!offerId) {
                return res.status(400).json({ error: "Offer ID is required" });
            }

            // Validate inputs
            const validatedData = respondOfferSchema.parse(req.body);

            const result = await SellerService.respondToOffer(sellerId, offerId, validatedData.status as any, req.ip);

            return res.status(200).json({ message: "Offer responded successfully", data: result });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: "Validation failed", details: error.errors });
            }
            if (error.message === "Offer not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "Unauthorized to respond to this offer") {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.startsWith("Cannot respond to an offer") || error.message.startsWith("An offer has already been accepted")) {
                return res.status(400).json({ error: error.message });
            }
            console.error("[SellerController.respondToOffer] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async publishListing(req: Request, res: Response) {
        try {
            const sellerId = req.user?.userId;
            const listingId = req.params.id;

            if (!sellerId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!listingId) {
                return res.status(400).json({ error: "Listing ID is required" });
            }

            const listing = await SellerService.publishListing(sellerId, listingId, req.ip);

            return res.status(200).json({ message: "Listing published successfully", data: { listing } });
        } catch (error: any) {
            if (error.message === "Listing not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "Unauthorized to publish this listing") {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.startsWith("Cannot publish a listing")) {
                return res.status(400).json({ error: error.message });
            }
            console.error("[SellerController.publishListing] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
