import { Router } from "express";
import { requireAuth, requireApprovedKYC } from "../auth/auth.middleware";
import { SellerController } from "./seller.controller";

const router = Router();

// ----------------------------------------------------------------------
// Seller Offer Routes (Requires Auth & Approved KYC unless bypassed)
// ----------------------------------------------------------------------

// 1. Respond to an offer
router.patch("/seller/offers/:id/respond", requireAuth, requireApprovedKYC, SellerController.respondToOffer);

// 2. Publish an approved listing
router.post("/seller/listings/:id/publish", requireAuth, requireApprovedKYC, SellerController.publishListing);

export const sellerRoutes = router;
