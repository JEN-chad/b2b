import { Router } from "express";
import { KycController } from "./kyc.controller";
import { requireAuth, requireRole } from "../auth/auth.middleware";

const router = Router();

// Buyer/Seller endpoint: Submit KYC
router.post("/submit", requireAuth, KycController.submitKYC);

// Buyer/Seller endpoint: View current KYC status
router.get("/status", requireAuth, KycController.getKYCStatus);

// Admin / Compliance endpoint: Review a KYC submission
router.patch("/:id/review", requireAuth, requireRole(["ADMIN", "COMPLIANCE"]), KycController.reviewKYC);

export const kycRoutes = router;
