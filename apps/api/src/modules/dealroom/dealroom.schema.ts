import { z } from "zod";

export const updateDealRoomStatusSchema = z.object({
    status: z.enum([
        "INITIATED",
        "ESCROW_PENDING",
        "ESCROW_FUNDED",
        "DUE_DILIGENCE",
        "AGREEMENT_SIGNED",
        "TRANSFER_IN_PROGRESS",
        "AWAITING_CONFIRMATION",
        "COMPLETED",
        "CANCELLED",
    ]),
});

export const addTaskSchema = z.object({
    title: z.string().min(1, "Task title is required").max(500),
    assignedTo: z.enum(["BUYER", "SELLER"]),
});

export const escrowWebhookSchema = z.object({
    dealRoomId: z.string().uuid("Invalid deal room ID"),
    provider: z.string().min(1),
    externalId: z.string().min(1),
    amount: z.number().int().positive("Amount must be a positive integer"),
    status: z.enum(["PENDING", "FUNDED", "RELEASED", "REFUNDED", "FAILED"]),
});

export const cancelDealRoomSchema = z.object({
    reason: z.string().min(1, "Cancellation reason is required").max(1000),
});

export const adminReleaseEscrowSchema = z.object({
    reason: z.string().min(1, "Reason for release is required").max(1000),
});

export const adminOverrideStatusSchema = z.object({
    status: z.enum([
        "INITIATED",
        "ESCROW_PENDING",
        "ESCROW_FUNDED",
        "DUE_DILIGENCE",
        "AGREEMENT_SIGNED",
        "TRANSFER_IN_PROGRESS",
        "AWAITING_CONFIRMATION",
        "COMPLETED",
        "CANCELLED",
    ]),
    reason: z.string().min(1, "Reason for override is required").max(1000),
});
