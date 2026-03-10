import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { DealRoomController } from "./dealroom.controller";

const router = Router();

// ----------------------------------------------------------------------
// Deal Room Routes (Requires Auth)
// ----------------------------------------------------------------------

// List all deal rooms for the authenticated user
router.get("/deal-rooms", requireAuth, DealRoomController.listDealRooms);

// Get a specific deal room by ID
router.get("/deal-rooms/:id", requireAuth, DealRoomController.getDealRoom);

// Update deal room status (state machine transitions)
router.patch("/deal-rooms/:id/status", requireAuth, DealRoomController.updateStatus);

// Add a task to the deal room checklist
router.post("/deal-rooms/:id/tasks", requireAuth, DealRoomController.addTask);

// Complete a deal room task (only by assignee)
router.patch("/deal-rooms/tasks/:taskId/complete", requireAuth, DealRoomController.completeTask);

// Buyer confirms asset receipt (dual-approval escrow release)
router.post("/deal-rooms/:id/escrow/confirm-receipt", requireAuth, DealRoomController.confirmReceipt);

// Cancel a deal room
router.post("/deal-rooms/:id/cancel", requireAuth, DealRoomController.cancelDealRoom);

// ----------------------------------------------------------------------
// Escrow Webhook (No Auth — HMAC signature verified in controller)
// ----------------------------------------------------------------------

router.post("/webhooks/escrow", DealRoomController.escrowWebhook);

// ----------------------------------------------------------------------
// Admin Routes (Requires Auth + ADMIN role)
// ----------------------------------------------------------------------

// Admin: Release escrow manually
router.post(
    "/admin/deal-rooms/:id/release-escrow",
    requireAuth,
    requireRole(["ADMIN"]),
    DealRoomController.adminReleaseEscrow
);

// Admin: Override deal room status
router.patch(
    "/admin/deal-rooms/:id/override-status",
    requireAuth,
    requireRole(["ADMIN"]),
    DealRoomController.adminOverrideStatus
);

export const dealRoomRoutes = router;
