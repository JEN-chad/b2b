import { db, users, kycRecords, auditLogs } from "@b2b/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { env } from "@b2b/config";

// Quick and simple symmetric encryption using AES-256-CBC
// Note: In production we'd want this key properly injected/managed
const ENCRYPTION_KEY = crypto.scryptSync(env.JWT_SECRET, 'salt', 32);
const IV_LENGTH = 16;

function encrypt(text: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

export class KycService {
    static async submitKYC(userId: string, data: any) {
        return await db.transaction(async (tx) => {
            const existingRecord = await tx.select().from(kycRecords).where(eq(kycRecords.userId, userId)).limit(1);

            const encryptedPan = encrypt(data.panNumber);

            let record;

            if (existingRecord.length > 0) {
                // Update
                [record] = await tx.update(kycRecords).set({
                    panNumber: encryptedPan,
                    aadhaarMasked: data.aadhaarMasked,
                    companyPan: data.companyPan,
                    cinOrLlpin: data.cinOrLlpin,
                    gstNumber: data.gstNumber,
                    status: "PENDING", // Puts it back to pending if they resubmit
                    rejectionReason: null,
                    submittedAt: new Date()
                }).where(eq(kycRecords.userId, userId)).returning();
            } else {
                // Insert
                [record] = await tx.insert(kycRecords).values({
                    userId,
                    panNumber: encryptedPan,
                    aadhaarMasked: data.aadhaarMasked,
                    companyPan: data.companyPan,
                    cinOrLlpin: data.cinOrLlpin,
                    gstNumber: data.gstNumber,
                    status: "PENDING"
                }).returning();
            }

            // Update user cache status
            await tx.update(users).set({
                kycStatus: "PENDING"
            }).where(eq(users.id, userId));

            // Audit Trail
            await tx.insert(auditLogs).values({
                action: "KYC_SUBMITTED",
                entityType: "USER",
                entityId: userId,
                userId: userId
            });

            return record;
        });
    }

    static async getKYCByUserId(userId: string) {
        const result = await db.select().from(kycRecords).where(eq(kycRecords.userId, userId)).limit(1);
        return result[0];
    }

    static async reviewKYC(kycId: string, reviewerId: string, status: "APPROVED" | "REJECTED" | "UNDER_REVIEW", rejectionReason?: string) {
        return await db.transaction(async (tx) => {
            const [record] = await tx.update(kycRecords).set({
                status,
                reviewerId,
                rejectionReason: rejectionReason || null,
                reviewedAt: new Date()
            }).where(eq(kycRecords.id, kycId)).returning();

            if (!record) {
                throw new Error("KYC record not found");
            }

            // Update user central profile cache
            await tx.update(users).set({
                kycStatus: status
            }).where(eq(users.id, record.userId));

            // Audit
            await tx.insert(auditLogs).values({
                action: `KYC_${status}`,
                entityType: "KYC_RECORD",
                entityId: kycId,
                userId: reviewerId, // The admin mapping
                metadata: { reason: rejectionReason }
            });

            return record;
        });
    }
}
