import { pgTable, uuid, text, boolean, timestamp, pgEnum, jsonb, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["BUYER", "SELLER", "ADMIN", "COMPLIANCE"]);
export const kycStatusEnum = pgEnum("kyc_status", ["NOT_STARTED", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]);
export const entityTypeEnum = pgEnum("entity_type", ["INDIVIDUAL", "COMPANY"]);
export const otpTypeEnum = pgEnum("otp_type", ["EMAIL_VERIFY", "LOGIN", "PHONE_VERIFY"]);

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash"),
    role: roleEnum("role").notNull().default("BUYER"),
    emailVerified: boolean("email_verified").notNull().default(false),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    kycStatus: kycStatusEnum("kyc_status").notNull().default("NOT_STARTED"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    fullName: text("full_name"),
    phoneNumber: text("phone_number"),
    country: text("country"),
    state: text("state"),
    entityType: entityTypeEnum("entity_type").notNull().default("INDIVIDUAL"),
});

export const sessions = pgTable("sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    revoked: boolean("revoked").notNull().default(false),
});

export const auditLogs = pgTable("audit_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const otpTokens = pgTable("otp_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    emailOrPhone: text("email_or_phone").notNull(),
    codeHash: text("code_hash").notNull(),
    type: otpTypeEnum("type").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    attempts: integer("attempts").notNull().default(0),
});

export const kycRecords = pgTable("kyc_records", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    panNumber: text("pan_number").notNull(),
    aadhaarMasked: text("aadhaar_masked"),
    companyPan: text("company_pan"),
    cinOrLlpin: text("cin_or_llpin"),
    gstNumber: text("gst_number"),
    status: kycStatusEnum("status").notNull().default("PENDING"),
    reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
    rejectionReason: text("rejection_reason"),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
    reviewedAt: timestamp("reviewed_at"),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
    profile: one(profiles, {
        fields: [users.id],
        references: [profiles.userId],
    }),
    sessions: many(sessions),
    auditLogs: many(auditLogs),
    kycRecord: one(kycRecords, {
        fields: [users.id],
        references: [kycRecords.userId],
    })
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
    user: one(users, {
        fields: [profiles.userId],
        references: [users.id],
    }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    user: one(users, {
        fields: [auditLogs.userId],
        references: [users.id],
    }),
}));
