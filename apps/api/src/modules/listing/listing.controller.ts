import { Request, Response } from "express";
import { ListingService } from "./listing.service";
import { createListingSchema, updateListingSchema } from "./listing.schema";

export class ListingController {
    static async createListing(req: Request, res: Response) {
        try {
            const sellerId = req.user?.userId;
            if (!sellerId) return res.status(401).json({ error: "Unauthorized" });

            const validatedData = createListingSchema.parse(req.body);
            const listing = await ListingService.createListing(sellerId, validatedData);

            res.status(201).json({ message: "Listing created successfully", data: listing });
        } catch (error: any) {
             if (error.name === 'ZodError') {
                return res.status(400).json({ error: "Validation failed", details: error.errors });
             }
             res.status(500).json({ error: error.message || "Internal server error" });
        }
    }

    static async getListings(req: Request, res: Response) {
        try {
             const listings = await ListingService.getListings();
             res.status(200).json({ data: listings });
        } catch (error: any) {
             res.status(500).json({ error: "Internal server error" });
        }
    }

    static async getListing(req: Request, res: Response) {
        try {
             const { id } = req.params;
             const listing = await ListingService.getListingById(id);
             if (!listing) return res.status(404).json({ error: "Listing not found" });

             res.status(200).json({ data: listing });
        } catch (error: any) {
             res.status(500).json({ error: "Internal server error" });
        }
    }

    static async updateListing(req: Request, res: Response) {
         try {
             const sellerId = req.user?.userId;
             if (!sellerId) return res.status(401).json({ error: "Unauthorized" });

             const { id } = req.params;
             const validatedData = updateListingSchema.parse(req.body);

             const updated = await ListingService.updateListing(id, sellerId, validatedData);
             res.status(200).json({ message: "Listing updated successfully", data: updated });
         } catch (error: any) {
             if (error.name === 'ZodError') {
                return res.status(400).json({ error: "Validation failed", details: error.errors });
             }
             res.status(403).json({ error: error.message || "Failed to update listing" });
         }
    }

    static async submitListing(req: Request, res: Response) {
         try {
             const sellerId = req.user?.userId;
             if (!sellerId) return res.status(401).json({ error: "Unauthorized" });

             const { id } = req.params;
             const submitted = await ListingService.submitListing(id, sellerId);
             
             res.status(200).json({ message: "Listing submitted for review", data: submitted });
         } catch(error: any) {
              res.status(400).json({ error: error.message || "Failed to submit listing" });
         }
    }

    static async reviewListing(req: Request, res: Response) {
        try {
             const adminId = req.user?.userId;
             if (!adminId) return res.status(401).json({ error: "Unauthorized" });

             const { id } = req.params;
             const { status } = req.body;
             
             if (!["APPROVED", "CHANGES_REQUESTED", "LIVE", "LOCKED", "SOLD"].includes(status)) {
                 return res.status(400).json({ error: "Invalid status update" });
             }

             const updated = await ListingService.reviewListing(id, adminId, status);
             res.status(200).json({ message: `Listing marked as ${status}`, data: updated });
        } catch(error: any) {
             res.status(400).json({ error: error.message || "Failed to review listing" });
        }
    }
}
