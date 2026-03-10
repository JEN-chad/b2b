import { db } from "@b2b/db";
import { dealRooms, dealTasks, escrowTransactions, listings, auditLogs } from "@b2b/db";
import { eq, and, or } from "drizzle-orm";
import { env } from "@b2b/config";
import crypto from "crypto";

const VALID_TRANSITIONS: Record<string, string[]> = {
    INITIATED: ["ESCROW_PENDING", "CANCELLED"],
    ESCROW_PENDING: ["ESCROW_FUNDED", "CANCELLED"],
    ESCROW_FUNDED: ["DUE_DILIGENCE", "CANCELLED"],
    DUE_DILIGENCE: ["AGREEMENT_SIGNED", "CANCELLED"],
    AGREEMENT_SIGNED: ["TRANSFER_IN_PROGRESS", "CANCELLED"],
    TRANSFER_IN_PROGRESS: ["AWAITING_CONFIRMATION", "CANCELLED"],
    AWAITING_CONFIRMATION: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
};

export class DealRoomService {
    static async getDealRoom(userId: string, dealRoomId: string) {
        const dealRoom = await db.query.dealRooms.findFirst({
            where: eq(dealRooms.id, dealRoomId),
            with: {
                tasks: true,
                escrowTransactions: true,
                listing: true,
            },
        });

        if (!dealRoom) {
            throw new Error("Deal room not found");
        }

        if (dealRoom.buyerId !== userId && dealRoom.sellerId !== userId) {
            throw new Error("Unauthorized access to deal room");
        }

        return dealRoom;
    }

    static async getDealRoomForAdmin(dealRoomId: string) {
        const dealRoom = await db.query.dealRooms.findFirst({
            where: eq(dealRooms.id, dealRoomId),
            with: {
                tasks: true,
                escrowTransactions: true,
                listing: true,
            },
        });

        if (!dealRoom) {
            throw new Error("Deal room not found");
        }

        return dealRoom;
    }

    static async listDealRoomsByUser(userId: string) {
        const rooms = await db.query.dealRooms.findMany({
            where: or(
                eq(dealRooms.buyerId, userId),
                eq(dealRooms.sellerId, userId)
            ),
            with: {
                listing: true,
                tasks: true,
            },
            orderBy: (dealRooms, { desc }) => [desc(dealRooms.createdAt)],
        });

        return rooms;
    }

    static async updateDealRoomStatus(
        userId: string,
        dealRoomId: string,
        newStatus: string,
        ipAddress?: string
    ) {
        const defaultIp = "127.0.0.1";
        return await db.transaction(async (tx) => {
            const dealRoom = await tx.query.dealRooms.findFirst({
                where: eq(dealRooms.id, dealRoomId),
            });

            if (!dealRoom) {
                throw new Error("Deal room not found");
            }

            if (dealRoom.buyerId !== userId && dealRoom.sellerId !== userId) {
                throw new Error("Unauthorized access to deal room");
            }

            const allowed = VALID_TRANSITIONS[dealRoom.status];
            if (!allowed || !allowed.includes(newStatus)) {
                throw new Error(
                    `Invalid status transition from ${dealRoom.status} to ${newStatus}`
                );
            }

            const [updated] = await tx
                .update(dealRooms)
                .set({ status: newStatus as any, updatedAt: new Date() })
                .where(eq(dealRooms.id, dealRoomId))
                .returning();

            await tx.insert(auditLogs).values({
                userId,
                action: "DEAL_ROOM_STATUS_UPDATED",
                entityType: "DEAL_ROOM",
                entityId: dealRoomId,
                ipAddress: ipAddress || defaultIp,
                metadata: {
                    previousStatus: dealRoom.status,
                    newStatus,
                },
            });

            return updated;
        });
    }

    static async addTask(
        userId: string,
        dealRoomId: string,
        title: string,
        assignedTo: "BUYER" | "SELLER",
        ipAddress?: string
    ) {
        const defaultIp = "127.0.0.1";
        return await db.transaction(async (tx) => {
            const dealRoom = await tx.query.dealRooms.findFirst({
                where: eq(dealRooms.id, dealRoomId),
            });

            if (!dealRoom) {
                throw new Error("Deal room not found");
            }

            if (dealRoom.buyerId !== userId && dealRoom.sellerId !== userId) {
                throw new Error("Unauthorized access to deal room");
            }

            if (dealRoom.status === "COMPLETED" || dealRoom.status === "CANCELLED") {
                throw new Error("Cannot add tasks to a completed or cancelled deal room");
            }

            const [task] = await tx
                .insert(dealTasks)
                .values({
                    dealRoomId,
                    title,
                    assignedTo,
                })
                .returning();

            await tx.insert(auditLogs).values({
                userId,
                action: "DEAL_TASK_ADDED",
                entityType: "DEAL_TASK",
                entityId: task.id,
                ipAddress: ipAddress || defaultIp,
                metadata: { title, assignedTo, dealRoomId },
            });

            return task;
        });
    }

    static async completeTask(userId: string, taskId: string, ipAddress?: string) {
        const defaultIp = "127.0.0.1";
        return await db.transaction(async (tx) => {
            const task = await tx.query.dealTasks.findFirst({
                where: eq(dealTasks.id, taskId),
                with: {
                    dealRoom: true,
                },
            });

            if (!task) {
                throw new Error("Task not found");
            }

            const dealRoom = task.dealRoom;

            if (dealRoom.buyerId !== userId && dealRoom.sellerId !== userId) {
                throw new Error("Unauthorized access to deal room");
            }

            const isBuyer = dealRoom.buyerId === userId;
            const isSeller = dealRoom.sellerId === userId;

            if (task.assignedTo === "BUYER" && !isBuyer) {
                throw new Error("Only the buyer can complete this task");
            }

            if (task.assignedTo === "SELLER" && !isSeller) {
                throw new Error("Only the seller can complete this task");
            }

            if (task.completed) {
                throw new Error("Task is already completed");
            }

            const [updated] = await tx
                .update(dealTasks)
                .set({ completed: true, completedAt: new Date() })
                .where(eq(dealTasks.id, taskId))
                .returning();

            await tx.insert(auditLogs).values({
                userId,
                action: "DEAL_TASK_COMPLETED",
                entityType: "DEAL_TASK",
                entityId: taskId,
                ipAddress: ipAddress || defaultIp,
                metadata: { title: task.title, dealRoomId: dealRoom.id },
            });

            return updated;
        });
    }

    static verifyWebhookSignature(payload: string, signature: string): boolean {
        const expected = crypto
            .createHmac("sha256", env.ESCROW_WEBHOOK_SECRET)
            .update(payload)
            .digest("hex");
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    }

    static async processEscrowWebhook(data: {
        dealRoomId: string;
        provider: string;
        externalId: string;
        amount: number;
        status: "PENDING" | "FUNDED" | "RELEASED" | "REFUNDED" | "FAILED";
    }) {
        return await db.transaction(async (tx) => {
            const dealRoom = await tx.query.dealRooms.findFirst({
                where: eq(dealRooms.id, data.dealRoomId),
            });

            if (!dealRoom) {
                throw new Error("Deal room not found");
            }

            const existingEscrow = await tx.query.escrowTransactions.findFirst({
                where: and(
                    eq(escrowTransactions.dealRoomId, data.dealRoomId),
                    eq(escrowTransactions.externalId, data.externalId)
                ),
            });

            let escrowRecord;

            if (existingEscrow) {
                const [updated] = await tx
                    .update(escrowTransactions)
                    .set({ status: data.status, updatedAt: new Date() })
                    .where(eq(escrowTransactions.id, existingEscrow.id))
                    .returning();
                escrowRecord = updated;
            } else {
                const [inserted] = await tx
                    .insert(escrowTransactions)
                    .values({
                        dealRoomId: data.dealRoomId,
                        provider: data.provider,
                        externalId: data.externalId,
                        amount: data.amount,
                        status: data.status,
                    })
                    .returning();
                escrowRecord = inserted;
            }

            if (data.status === "FUNDED") {
                await tx
                    .update(dealRooms)
                    .set({ status: "ESCROW_FUNDED", updatedAt: new Date() })
                    .where(eq(dealRooms.id, data.dealRoomId));

                await tx
                    .update(listings)
                    .set({ status: "LOCKED", updatedAt: new Date() })
                    .where(eq(listings.id, dealRoom.listingId));

                await tx.insert(auditLogs).values({
                    action: "LISTING_LOCKED_BY_ESCROW",
                    entityType: "LISTING",
                    entityId: dealRoom.listingId,
                    metadata: { dealRoomId: data.dealRoomId, escrowExternalId: data.externalId },
                });
            }

            await tx.insert(auditLogs).values({
                action: "ESCROW_WEBHOOK_PROCESSED",
                entityType: "ESCROW_TRANSACTION",
                entityId: escrowRecord.id,
                metadata: {
                    provider: data.provider,
                    externalId: data.externalId,
                    amount: data.amount,
                    status: data.status,
                    dealRoomId: data.dealRoomId,
                },
            });

            return escrowRecord;
        });
    }

    static async confirmReceipt(userId: string, dealRoomId: string, ipAddress?: string) {
        const defaultIp = "127.0.0.1";
        return await db.transaction(async (tx) => {
            const dealRoom = await tx.query.dealRooms.findFirst({
                where: eq(dealRooms.id, dealRoomId),
                with: {
                    tasks: true,
                },
            });

            if (!dealRoom) {
                throw new Error("Deal room not found");
            }

            if (dealRoom.buyerId !== userId) {
                throw new Error("Only the buyer can confirm receipt");
            }

            if (dealRoom.status !== "AWAITING_CONFIRMATION") {
                throw new Error(
                    `Cannot confirm receipt in status ${dealRoom.status}. Deal room must be in AWAITING_CONFIRMATION status.`
                );
            }

            const sellerTasks = dealRoom.tasks.filter((t) => t.assignedTo === "SELLER");
            const allSellerTasksComplete = sellerTasks.length === 0 || sellerTasks.every((t) => t.completed);

            if (!allSellerTasksComplete) {
                throw new Error("All seller tasks must be completed before confirming receipt");
            }

            const [updated] = await tx
                .update(dealRooms)
                .set({ status: "COMPLETED", updatedAt: new Date() })
                .where(eq(dealRooms.id, dealRoomId))
                .returning();

            await tx
                .update(listings)
                .set({ status: "SOLD", updatedAt: new Date() })
                .where(eq(listings.id, dealRoom.listingId));

            await tx.insert(auditLogs).values({
                userId,
                action: "DEAL_ROOM_RECEIPT_CONFIRMED",
                entityType: "DEAL_ROOM",
                entityId: dealRoomId,
                ipAddress: ipAddress || defaultIp,
                metadata: { listingId: dealRoom.listingId },
            });

            return updated;
        });
    }

    static async adminReleaseEscrow(
        dealRoomId: string,
        adminId: string,
        reason: string,
        ipAddress?: string
    ) {
        const defaultIp = "127.0.0.1";
        return await db.transaction(async (tx) => {
            const dealRoom = await tx.query.dealRooms.findFirst({
                where: eq(dealRooms.id, dealRoomId),
                with: {
                    escrowTransactions: true,
                },
            });

            if (!dealRoom) {
                throw new Error("Deal room not found");
            }

            const fundedEscrow = dealRoom.escrowTransactions.find(
                (e) => e.status === "FUNDED"
            );

            if (!fundedEscrow) {
                throw new Error("No funded escrow transaction found for this deal room");
            }

            const [updatedEscrow] = await tx
                .update(escrowTransactions)
                .set({ status: "RELEASED", updatedAt: new Date() })
                .where(eq(escrowTransactions.id, fundedEscrow.id))
                .returning();

            await tx.insert(auditLogs).values({
                userId: adminId,
                action: "ADMIN_ESCROW_RELEASED",
                entityType: "ESCROW_TRANSACTION",
                entityId: fundedEscrow.id,
                ipAddress: ipAddress || defaultIp,
                metadata: {
                    reason,
                    dealRoomId,
                    amount: fundedEscrow.amount,
                },
            });

            return updatedEscrow;
        });
    }

    static async adminOverrideStatus(
        dealRoomId: string,
        adminId: string,
        newStatus: string,
        reason: string,
        ipAddress?: string
    ) {
        const defaultIp = "127.0.0.1";
        return await db.transaction(async (tx) => {
            const dealRoom = await tx.query.dealRooms.findFirst({
                where: eq(dealRooms.id, dealRoomId),
            });

            if (!dealRoom) {
                throw new Error("Deal room not found");
            }

            const previousStatus = dealRoom.status;

            const [updated] = await tx
                .update(dealRooms)
                .set({ status: newStatus as any, updatedAt: new Date() })
                .where(eq(dealRooms.id, dealRoomId))
                .returning();

            await tx.insert(auditLogs).values({
                userId: adminId,
                action: "ADMIN_DEAL_ROOM_STATUS_OVERRIDE",
                entityType: "DEAL_ROOM",
                entityId: dealRoomId,
                ipAddress: ipAddress || defaultIp,
                metadata: { previousStatus, newStatus, reason },
            });

            return updated;
        });
    }

    static async cancelDealRoom(
        userId: string,
        dealRoomId: string,
        reason: string,
        ipAddress?: string
    ) {
        const defaultIp = "127.0.0.1";
        return await db.transaction(async (tx) => {
            const dealRoom = await tx.query.dealRooms.findFirst({
                where: eq(dealRooms.id, dealRoomId),
            });

            if (!dealRoom) {
                throw new Error("Deal room not found");
            }

            if (dealRoom.buyerId !== userId && dealRoom.sellerId !== userId) {
                throw new Error("Unauthorized access to deal room");
            }

            if (dealRoom.status === "COMPLETED" || dealRoom.status === "CANCELLED") {
                throw new Error(`Cannot cancel a deal room with status ${dealRoom.status}`);
            }

            const [updated] = await tx
                .update(dealRooms)
                .set({ status: "CANCELLED", updatedAt: new Date() })
                .where(eq(dealRooms.id, dealRoomId))
                .returning();

            await tx.insert(auditLogs).values({
                userId,
                action: "DEAL_ROOM_CANCELLED",
                entityType: "DEAL_ROOM",
                entityId: dealRoomId,
                ipAddress: ipAddress || defaultIp,
                metadata: { reason, previousStatus: dealRoom.status },
            });

            return updated;
        });
    }
}
