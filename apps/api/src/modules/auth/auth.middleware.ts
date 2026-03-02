import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@b2b/config";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: "BUYER" | "SELLER" | "ADMIN" | "COMPLIANCE";
                kycStatus: "NOT_STARTED" | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
                sessionId: string;
            };
        }
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: insufficient permissions" });
        }
        next();
    };
};

export const requireApprovedKYC = (req: Request, res: Response, next: NextFunction) => {
    if (process.env.KYC_ENFORCEMENT === "BYPASS") {
        return next();
    }

    if (!req.user || req.user.kycStatus !== "APPROVED") {
        return res.status(403).json({ error: "Forbidden: KYC not approved" });
    }

    next();
};
