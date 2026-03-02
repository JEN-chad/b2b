import { z } from "zod";

export const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const verifySchema = z.object({
    email: z.string().email(),
    code: z.string().min(6).max(6),
});
