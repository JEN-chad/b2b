import { Request, Response } from "express";
import { z } from "zod";
import { BuyerService } from "./buyer.service";
import { createOfferSchema } from "./buyer.schema";

export class BuyerController {
    static async signNDA(req: Request, res: Response) {
        try {
            const buyerId = req.user?.userId;
            const listingId = req.params.id;

            if (!buyerId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!listingId) {
                return res.status(400).json({ error: "Listing ID is required" });
            }

            const nda = await BuyerService.signNDA(buyerId, listingId, req.ip);

            return res.status(201).json({ message: "NDA signed successfully", data: { nda } });
        } catch (error: any) {
            if (error.message === "Listing not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "NDA already signed for this listing") {
                return res.status(409).json({ error: error.message });
            }
            console.error("[BuyerController.signNDA] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async unlockListing(req: Request, res: Response) {
        try {
            const buyerId = req.user?.userId;
            const listingId = req.params.id;

            if (!buyerId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!listingId) {
                return res.status(400).json({ error: "Listing ID is required" });
            }

            const unlockRecord = await BuyerService.unlockListing(buyerId, listingId, req.ip);

            return res.status(201).json({ message: "Listing unlocked successfully", data: { unlockRecord } });
        } catch (error: any) {
            if (error.message === "Listing not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "NDA signature required before unlocking this listing") {
                return res.status(403).json({ error: error.message });
            }
            if (error.message === "Listing already unlocked") {
                return res.status(409).json({ error: error.message });
            }
            console.error("[BuyerController.unlockListing] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async createOffer(req: Request, res: Response) {
        try {
            const buyerId = req.user?.userId;
            const listingId = req.params.id;

            if (!buyerId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!listingId) {
                return res.status(400).json({ error: "Listing ID is required" });
            }

            // Validate inputs
            const validatedData = createOfferSchema.parse(req.body);

            const offer = await BuyerService.createOffer(buyerId, listingId, validatedData, req.ip);

            return res.status(201).json({ message: "Offer submitted successfully", data: { offer } });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: "Validation failed", details: error.errors });
            }
            if (error.message === "Listing not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.startsWith("Cannot make an offer")) {
                return res.status(400).json({ error: error.message });
            }
            console.error("[BuyerController.createOffer] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
