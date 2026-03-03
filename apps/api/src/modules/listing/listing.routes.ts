import { Router } from "express";
import { requireAuth, requireApprovedKYC, requireRole } from "../auth/auth.middleware";
import { ListingController } from "./listing.controller";

const router = Router();

// ----------------------------------------------------------------------
// Seller Routes (Requires Auth & Approved KYC unless bypassed)
// ----------------------------------------------------------------------
router.post("/seller/listings", requireAuth, requireApprovedKYC, ListingController.createListing);
router.patch("/seller/listings/:id", requireAuth, requireApprovedKYC, ListingController.updateListing);
router.post("/seller/listings/:id/submit", requireAuth, requireApprovedKYC, ListingController.submitListing);

// ----------------------------------------------------------------------
// Admin Routes (Requires Auth & Admin/Compliance Role)
// ----------------------------------------------------------------------
router.patch("/admin/listings/:id/review", requireAuth, requireRole(["ADMIN", "COMPLIANCE"]), ListingController.reviewListing);

// ----------------------------------------------------------------------
// Public / Buyer Routes
// ----------------------------------------------------------------------
router.get("/listings", ListingController.getListings);
router.get("/listings/:id", ListingController.getListing);

export const listingRoutes = router;
