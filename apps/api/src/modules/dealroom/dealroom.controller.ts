import { Request, Response } from "express";
import { z } from "zod";
import { DealRoomService } from "./dealroom.service";
import {
    updateDealRoomStatusSchema,
    addTaskSchema,
    escrowWebhookSchema,
    cancelDealRoomSchema,
    adminReleaseEscrowSchema,
    adminOverrideStatusSchema,
} from "./dealroom.schema";

export class DealRoomController {
    static async getDealRoom(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            const dealRoomId = req.params.id;

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!dealRoomId) {
                return res.status(400).json({ error: "Deal room ID is required" });
            }

            const dealRoom = await DealRoomService.getDealRoom(userId, dealRoomId);

            return res.status(200).json({ data: { dealRoom } });
        } catch (error: any) {
            if (error.message === "Deal room not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "Unauthorized access to deal room") {
                return res.status(403).json({ error: error.message });
            }
            console.error("[DealRoomController.getDealRoom] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async listDealRooms(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const dealRooms = await DealRoomService.listDealRoomsByUser(userId);

            return res.status(200).json({ data: { dealRooms } });
        } catch (error: any) {
            console.error("[DealRoomController.listDealRooms] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async updateStatus(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            const dealRoomId = req.params.id;

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!dealRoomId) {
                return res.status(400).json({ error: "Deal room ID is required" });
            }

            const validatedData = updateDealRoomStatusSchema.parse(req.body);

            const updated = await DealRoomService.updateDealRoomStatus(
                userId,
                dealRoomId,
                validatedData.status,
                req.ip
            );

            return res.status(200).json({ message: "Deal room status updated", data: { dealRoom: updated } });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: "Validation failed", details: error.errors });
            }
            if (error.message === "Deal room not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "Unauthorized access to deal room") {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.startsWith("Invalid status transition")) {
                return res.status(400).json({ error: error.message });
            }
            console.error("[DealRoomController.updateStatus] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async addTask(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            const dealRoomId = req.params.id;

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!dealRoomId) {
                return res.status(400).json({ error: "Deal room ID is required" });
            }

            const validatedData = addTaskSchema.parse(req.body);

            const task = await DealRoomService.addTask(
                userId,
                dealRoomId,
                validatedData.title,
                validatedData.assignedTo,
                req.ip
            );

            return res.status(201).json({ message: "Task added successfully", data: { task } });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: "Validation failed", details: error.errors });
            }
            if (error.message === "Deal room not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "Unauthorized access to deal room") {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.startsWith("Cannot add tasks")) {
                return res.status(400).json({ error: error.message });
            }
            console.error("[DealRoomController.addTask] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async completeTask(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            const taskId = req.params.taskId;

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!taskId) {
                return res.status(400).json({ error: "Task ID is required" });
            }

            const task = await DealRoomService.completeTask(userId, taskId, req.ip);

            return res.status(200).json({ message: "Task completed successfully", data: { task } });
        } catch (error: any) {
            if (error.message === "Task not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "Unauthorized access to deal room") {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.startsWith("Only the buyer") || error.message.startsWith("Only the seller")) {
                return res.status(403).json({ error: error.message });
            }
            if (error.message === "Task is already completed") {
                return res.status(409).json({ error: error.message });
            }
            console.error("[DealRoomController.completeTask] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async escrowWebhook(req: Request, res: Response) {
        try {
            const signature = req.headers["x-escrow-signature"] as string;

            if (!signature) {
                return res.status(401).json({ error: "Missing webhook signature" });
            }

            const rawBody = JSON.stringify(req.body);
            const isValid = DealRoomService.verifyWebhookSignature(rawBody, signature);

            if (!isValid) {
                return res.status(401).json({ error: "Invalid webhook signature" });
            }

            const validatedData = escrowWebhookSchema.parse(req.body);

            const escrowRecord = await DealRoomService.processEscrowWebhook(validatedData);

            return res.status(200).json({ message: "Webhook processed", data: { escrow: escrowRecord } });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: "Validation failed", details: error.errors });
            }
            if (error.message === "Deal room not found") {
                return res.status(404).json({ error: error.message });
            }
            console.error("[DealRoomController.escrowWebhook] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async confirmReceipt(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            const dealRoomId = req.params.id;

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!dealRoomId) {
                return res.status(400).json({ error: "Deal room ID is required" });
            }

            const updated = await DealRoomService.confirmReceipt(userId, dealRoomId, req.ip);

            return res.status(200).json({ message: "Receipt confirmed, deal completed", data: { dealRoom: updated } });
        } catch (error: any) {
            if (error.message === "Deal room not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "Only the buyer can confirm receipt") {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.startsWith("Cannot confirm receipt") || error.message.startsWith("All seller tasks")) {
                return res.status(400).json({ error: error.message });
            }
            console.error("[DealRoomController.confirmReceipt] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async cancelDealRoom(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            const dealRoomId = req.params.id;

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!dealRoomId) {
                return res.status(400).json({ error: "Deal room ID is required" });
            }

            const validatedData = cancelDealRoomSchema.parse(req.body);

            const updated = await DealRoomService.cancelDealRoom(
                userId,
                dealRoomId,
                validatedData.reason,
                req.ip
            );

            return res.status(200).json({ message: "Deal room cancelled", data: { dealRoom: updated } });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: "Validation failed", details: error.errors });
            }
            if (error.message === "Deal room not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "Unauthorized access to deal room") {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.startsWith("Cannot cancel")) {
                return res.status(400).json({ error: error.message });
            }
            console.error("[DealRoomController.cancelDealRoom] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async adminReleaseEscrow(req: Request, res: Response) {
        try {
            const adminId = req.user?.userId;
            const dealRoomId = req.params.id;

            if (!adminId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!dealRoomId) {
                return res.status(400).json({ error: "Deal room ID is required" });
            }

            const validatedData = adminReleaseEscrowSchema.parse(req.body);

            const escrow = await DealRoomService.adminReleaseEscrow(
                dealRoomId,
                adminId,
                validatedData.reason,
                req.ip
            );

            return res.status(200).json({ message: "Escrow released by admin", data: { escrow } });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: "Validation failed", details: error.errors });
            }
            if (error.message === "Deal room not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.startsWith("No funded escrow")) {
                return res.status(400).json({ error: error.message });
            }
            console.error("[DealRoomController.adminReleaseEscrow] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async adminOverrideStatus(req: Request, res: Response) {
        try {
            const adminId = req.user?.userId;
            const dealRoomId = req.params.id;

            if (!adminId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!dealRoomId) {
                return res.status(400).json({ error: "Deal room ID is required" });
            }

            const validatedData = adminOverrideStatusSchema.parse(req.body);

            const updated = await DealRoomService.adminOverrideStatus(
                dealRoomId,
                adminId,
                validatedData.status,
                validatedData.reason,
                req.ip
            );

            return res.status(200).json({ message: "Deal room status overridden by admin", data: { dealRoom: updated } });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: "Validation failed", details: error.errors });
            }
            if (error.message === "Deal room not found") {
                return res.status(404).json({ error: error.message });
            }
            console.error("[DealRoomController.adminOverrideStatus] Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
