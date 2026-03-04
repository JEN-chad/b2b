import { Router } from "express";
import { AuthController } from "./auth.controller";
import { requireAuth } from "./auth.middleware";
import rateLimit from "express-rate-limit";

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit to 5 attempts
    message: "Too many login attempts, please try again after 15 minutes"
});

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: "Too many OTP verification attempts, please try again later"
});

router.post("/signup", AuthController.signup);
router.post("/login", loginLimiter, AuthController.login);
router.post("/verify-email", otpLimiter, AuthController.verifyEmail);

router.post("/refresh", AuthController.refresh);

router.post("/logout", requireAuth, AuthController.logout);

export const authRoutes = router;
