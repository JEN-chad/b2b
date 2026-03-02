import { db, users, sessions, otpTokens, profiles, auditLogs } from "@b2b/db";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "@b2b/config";
import { addMinutes, addDays } from "date-fns";
import crypto from "crypto";

export class AuthService {
    static async createUser(email: string, passwordHash: string) {
        return await db.transaction(async (tx) => {
            const [user] = await tx.insert(users).values({
                email,
                passwordHash,
            }).returning();

            await tx.insert(profiles).values({
                userId: user.id,
            });

            await tx.insert(auditLogs).values({
                action: "USER_REGISTERED",
                entityType: "USER",
                entityId: user.id,
                userId: user.id,
            });

            return user;
        });
    }

    static async findUserByEmail(email: string) {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0];
    }

    static async generateOTP(email: string, type: "EMAIL_VERIFY" | "LOGIN" | "PHONE_VERIFY") {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = await bcrypt.hash(code, 10);
        const expiresAt = addMinutes(new Date(), 5);

        await db.insert(otpTokens).values({
            emailOrPhone: email,
            codeHash,
            type,
            expiresAt,
        });

        // TODO: In a real app, send email/SMS here
        console.log(`[DEV ONLY] OTP for ${email}: ${code}`);
        return code;
    }

    static async verifyOTP(email: string, code: string, type: "EMAIL_VERIFY" | "LOGIN" | "PHONE_VERIFY") {
        const now = new Date();

        // Find valid token
        const tokens = await db.select()
            .from(otpTokens)
            .where(
                and(
                    eq(otpTokens.emailOrPhone, email),
                    eq(otpTokens.type, type),
                    gt(otpTokens.expiresAt, now)
                )
            )
            .limit(1);

        const token = tokens[0];
        if (!token) {
            return false;
        }

        if (token.attempts >= 3) {
            return false;
        }

        const isValid = await bcrypt.compare(code, token.codeHash);

        if (!isValid) {
            await db.update(otpTokens)
                .set({ attempts: token.attempts + 1 })
                .where(eq(otpTokens.id, token.id));
            return false;
        }

        // Mark email as verified if needed
        if (type === "EMAIL_VERIFY") {
            await db.update(users)
                .set({ emailVerified: true })
                .where(eq(users.email, email));
        }

        // Delete token after successful use
        await db.delete(otpTokens).where(eq(otpTokens.id, token.id));
        return true;
    }

    static async createSession(user: any) {
        const refreshToken = crypto.randomBytes(40).toString('hex');
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        const [session] = await db.insert(sessions).values({
            userId: user.id,
            refreshTokenHash,
            expiresAt: addDays(new Date(), 7),
        }).returning();

        const accessToken = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                kycStatus: user.kycStatus,
                sessionId: session.id
            },
            env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        return { accessToken, refreshToken, session };
    }

    static async invalidateSession(sessionId: string) {
        await db.update(sessions)
            .set({ revoked: true })
            .where(eq(sessions.id, sessionId));
    }
}
