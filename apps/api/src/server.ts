import express from "express";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middleware/error.middleware";
import { authRoutes } from "./modules/auth/auth.routes";
import { env } from "@b2b/config";

const app = express();

app.use(express.json());
app.use(cookieParser());

// Mount the authentication routes
app.use("/auth", authRoutes);
import { kycRoutes } from "./modules/kyc/kyc.routes";
app.use("/kyc", kycRoutes);

import { listingRoutes } from "./modules/listing/listing.routes";
app.use("/", listingRoutes);

import { buyerRoutes } from "./modules/buyer/buyer.routes";
app.use("/", buyerRoutes);

import { sellerRoutes } from "./modules/seller/seller.routes";
app.use("/", sellerRoutes);

import { dealRoomRoutes } from "./modules/dealroom/dealroom.routes";
app.use("/", dealRoomRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

// Centralized error handling
app.use(globalErrorHandler);

const startServer = () => {
    try {
        app.listen(env.PORT, () => {
            console.log(`🚀 API Server running on port ${env.PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

export { app };
