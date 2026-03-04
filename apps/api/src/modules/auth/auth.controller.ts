import { Request, Response } from "express";
import { signupSchema, loginSchema, verifySchema } from "./auth.schema";
import { AuthService } from "./auth.service";
import bcrypt from "bcrypt";

export class AuthController {
    static async signup(req: Request, res: Response) {
        try {
            console.log("Incoming body:", req.body);
            const { email, password } = signupSchema.parse(req.body);

            const existingUser = await AuthService.findUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({ error: "Email already in use" });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const user = await AuthService.createUser(email, passwordHash);

            await AuthService.generateOTP(email, "EMAIL_VERIFY");

            res.status(201).json({ message: "User created, verification OTP sent" });
        } catch (e: any) {
            console.error("Signup error:", e);
            res.status(400).json({ error: e.errors || "Invalid input" });
        }
    }

    static async verifyEmail(req: Request, res: Response) {
        try {
            const { email, code } = verifySchema.parse(req.body);

            const isValid = await AuthService.verifyOTP(email, code, "EMAIL_VERIFY");
            if (!isValid) {
                return res.status(400).json({ error: "Invalid or expired OTP" });
            }

            res.json({ message: "Email verified successfully" });
        } catch (e: any) {
            res.status(400).json({ error: e.errors || "Invalid input" });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = loginSchema.parse(req.body);

            const user = await AuthService.findUserByEmail(email);
            if (!user || !user.passwordHash) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) {
                await AuthService.logFailedLogin(user.id, req.ip);
                return res.status(401).json({ error: "Invalid credentials" });
            }

            if (!user.emailVerified) {
                return res.status(403).json({ error: "Please verify your email first" });
            }

            const { accessToken, refreshToken } = await AuthService.createSession(user, req.ip);

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000 // 15 mins
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({ message: "Login successful" });
        } catch (e: any) {
            res.status(400).json({ error: e.errors || "Invalid input" });
        }
    }

    static async logout(req: Request, res: Response) {
        if (req.user?.sessionId) {
            await AuthService.invalidateSession(req.user.sessionId);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
    }

    static async refresh(req: Request, res: Response) {
        try {
            const { accessToken, refreshToken } = req.cookies;

            if (!accessToken || !refreshToken) {
                return res.status(401).json({ error: "Missing tokens" });
            }

            const tokens = await AuthService.refreshSession(accessToken, refreshToken, req.ip);

            res.cookie("accessToken", tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000 // 15 mins
            });

            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({ message: "Tokens refreshed successfully" });
        } catch (e: any) {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.status(401).json({ error: e.message || "Invalid refresh token" });
        }
    }
}
