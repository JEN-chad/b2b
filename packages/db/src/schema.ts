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

// Listing Enums
export const assetTypeEnum = pgEnum("asset_type", ["SAAS", "ECOMMERCE", "BLOG", "APP", "DOMAIN"]);
export const listingStatusEnum = pgEnum("listing_status", ["DRAFT", "UNDER_REVIEW", "CHANGES_REQUESTED", "APPROVED", "LIVE", "LOCKED", "SOLD"]);
export const listingVisibilityEnum = pgEnum("listing_visibility", ["PUBLIC", "PRIVATE"]);
export const documentTypeEnum = pgEnum("document_type", ["FINANCIAL_PROOF", "ANALYTICS_PROOF", "OWNERSHIP_PROOF"]);

export const listings = pgTable("listings", {
    id: uuid("id").defaultRandom().primaryKey(),
    sellerId: uuid("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    assetType: assetTypeEnum("asset_type").notNull(),
    industry: text("industry").notNull(),
    revenueMonthly: integer("revenue_monthly").notNull().default(0),
    profitMonthly: integer("profit_monthly").notNull().default(0),
    askingPrice: integer("asking_price").notNull(),
    status: listingStatusEnum("status").notNull().default("DRAFT"),
    visibility: listingVisibilityEnum("visibility").notNull().default("PRIVATE"),
    ndaRequired: boolean("nda_required").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const listingDocuments = pgTable("listing_documents", {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
    type: documentTypeEnum("type").notNull(),
    storageKey: text("storage_key").notNull(),
    verified: boolean("verified").notNull().default(false),
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
    }),
    listings: many(listings),
    buyerOffers: many(offers, { relationName: "buyerOffers" }),
    sellerDealRooms: many(dealRooms, { relationName: "sellerDealRooms" }),
    buyerDealRooms: many(dealRooms, { relationName: "buyerDealRooms" }),
    ndas: many(ndas),
    unlockRecords: many(unlockRecords)
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
    seller: one(users, {
        fields: [listings.sellerId],
        references: [users.id],
    }),
    documents: many(listingDocuments),
    offers: many(offers),
    ndas: many(ndas),
    unlockRecords: many(unlockRecords),
    dealRooms: many(dealRooms),
}));

export const listingDocumentsRelations = relations(listingDocuments, ({ one }) => ({
    listing: one(listings, {
        fields: [listingDocuments.listingId],
        references: [listings.id],
    }),
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

// -----------------------------------------------------------------------------
// Phase 6: Buyer Interaction System
// -----------------------------------------------------------------------------

export const offerStatusEnum = pgEnum("offer_status", ["PENDING", "COUNTERED", "ACCEPTED", "REJECTED", "EXPIRED"]);
export const dealRoomStatusEnum = pgEnum("deal_room_status", ["INITIATED", "ESCROW_PENDING", "ESCROW_FUNDED", "DUE_DILIGENCE", "AGREEMENT_SIGNED", "TRANSFER_IN_PROGRESS", "COMPLETED", "CANCELLED", "AWAITING_CONFIRMATION"]);

export const ndas = pgTable("ndas", {
    id: uuid("id").defaultRandom().primaryKey(),
    buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
    signedAt: timestamp("signed_at").notNull().defaultNow(),
});

export const ndasRelations = relations(ndas, ({ one }) => ({
    buyer: one(users, {
        fields: [ndas.buyerId],
        references: [users.id],
    }),
    listing: one(listings, {
        fields: [ndas.listingId],
        references: [listings.id],
    }),
}));

export const offers = pgTable("offers", {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    price: integer("price").notNull(),
    terms: text("terms"),
    status: offerStatusEnum("status").notNull().default("PENDING"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const offersRelations = relations(offers, ({ one }) => ({
    listing: one(listings, {
        fields: [offers.listingId],
        references: [listings.id],
    }),
    buyer: one(users, {
        fields: [offers.buyerId],
        references: [users.id],
        relationName: "buyerOffers",
    }),
}));

export const unlockRecords = pgTable("unlock_records", {
    id: uuid("id").defaultRandom().primaryKey(),
    buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
});

export const unlockRecordsRelations = relations(unlockRecords, ({ one }) => ({
    buyer: one(users, {
        fields: [unlockRecords.buyerId],
        references: [users.id],
    }),
    listing: one(listings, {
        fields: [unlockRecords.listingId],
        references: [listings.id],
    }),
}));

// Phase 7 Stub for auto-creating deal room after offer acceptance
export const dealRooms = pgTable("deal_rooms", {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    sellerId: uuid("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: dealRoomStatusEnum("status").notNull().default("INITIATED"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dealRoomsRelations = relations(dealRooms, ({ one }) => ({
    listing: one(listings, {
        fields: [dealRooms.listingId],
        references: [listings.id],
    }),
    buyer: one(users, {
        fields: [dealRooms.buyerId],
        references: [users.id],
        relationName: "buyerDealRooms"
    }),
    seller: one(users, {
        fields: [dealRooms.sellerId],
        references: [users.id],
        relationName: "sellerDealRooms"
    }),
}));
