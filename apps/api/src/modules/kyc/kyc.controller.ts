import { Request, Response } from "express";
import { submitKycSchema, reviewKycSchema } from "./kyc.schema";
import { KycService } from "./kyc.service";

export class KycController {
    static async submitKYC(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const data = submitKycSchema.parse(req.body);

            // Create or update the KYC record
            const kycRecord = await KycService.submitKYC(userId, data);

            res.status(201).json({ message: "KYC submitted successfully", data: { status: kycRecord.status } });
        } catch (e: any) {
            res.status(400).json({ error: e.errors || "Invalid input" });
        }
    }

    static async getKYCStatus(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            // Retrieve current status
            const kycRecord = await KycService.getKYCByUserId(userId);

            if (!kycRecord) {
                return res.json({ status: "NOT_STARTED" });
            }

            res.json({
                status: kycRecord.status,
                rejectionReason: kycRecord.rejectionReason,
                submittedAt: kycRecord.submittedAt
            });

        } catch (e: any) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    static async reviewKYC(req: Request, res: Response) {
        try {
            const reviewerId = req.user?.userId;
            const kycId = req.params.id;

            if (!reviewerId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const { status, rejectionReason } = reviewKycSchema.parse(req.body);

            if (status === "REJECTED" && !rejectionReason) {
                return res.status(400).json({ error: "Rejection reason is required when rejecting KYC" });
            }

            await KycService.reviewKYC(kycId, reviewerId, status, rejectionReason);

            res.json({ message: `KYC record updated to ${status}` });
        } catch (e: any) {
            console.error("reviewKYC error:", e);
            if (e.errors) {
                return res.status(400).json({ error: e.errors });
            }
            res.status(400).json({ error: e.message || "Invalid input" });
        }
    }
}
