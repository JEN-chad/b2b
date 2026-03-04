import { Router } from "express";
import { requireAuth, requireApprovedKYC } from "../auth/auth.middleware";
import { BuyerController } from "./buyer.controller";

const router = Router();

// ----------------------------------------------------------------------
// Buyer Routes (Requires Auth & Approved KYC unless bypassed)
// ----------------------------------------------------------------------

// 1. Sign NDA for a listing
router.post("/buyer/listings/:id/nda", requireAuth, requireApprovedKYC, BuyerController.signNDA);

// 2. Unlock listing details
router.post("/buyer/listings/:id/unlock", requireAuth, requireApprovedKYC, BuyerController.unlockListing);

// 3. Make an offer on a listing
router.post("/buyer/listings/:id/offer", requireAuth, requireApprovedKYC, BuyerController.createOffer);

export const buyerRoutes = router;
