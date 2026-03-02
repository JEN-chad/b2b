import { z } from "zod";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().default(8000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    JWT_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    KYC_ENFORCEMENT: z.enum(["STRICT", "BYPASS"]).default("STRICT"),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
