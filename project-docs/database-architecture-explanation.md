# Understanding User Roles, KYC, and Listing Assignment

You asked an excellent question about how the system handles users, sellers, and listings. Since there is no actual `sellers` table, it can be slightly confusing how a `BUYER` ends up creating a listing and acting as a seller.

Here is a clear breakdown of exactly what is happening under the hood based on our database design.

---

### 1. The Default User Role (The "Buyer")

When a new user registers on the platform, they are inserted into the `users` table. 
In the database schema, the `role` column defaults to `"BUYER"`:
```typescript
role: roleEnum("role").notNull().default("BUYER")
```
This means everyone starts as a "Buyer" by default. At this stage, their `kyc_status` is `"NOT_STARTED"`.

### 2. The KYC Approval Process (Admin Intervention)

When the user wants to list a digital asset (which is a sensitive action), the platform requires them to submit their KYC details via `/kyc/submit`.
1. The user's `kyc_status` becomes `"PENDING"`.
2. An **Admin** (another user in the database whose role is strictly `"ADMIN"` or `"COMPLIANCE"`) reviews this submission.
3. The Admin calls an endpoint to approve the KYC, which updates the user's `kyc_status` to `"APPROVED"`.

*Note: In `STRICT` enforcement mode, the application will completely block the user from creating a listing unless this status is `"APPROVED"`.*

### 3. How the Listing and "Seller" IDs Work

Once the user is approved, they can call the POST route to create a Listing. 

#### Where does the Listing `id` come from?
When the backend inserts the new listing into the database, the Neon PostgreSQL database **automatically generates a completely unique UUID** string (Universally Unique Identifier). 
```typescript
id: uuid("id").defaultRandom().primaryKey()
```
This becomes the listing's ID (e.g., `e456...`). It has no relation to the user's name or ID—it is just a random, guaranteed unique string to identify that specific asset.

#### How is it assigned, and where is the "Seller"?
If you look at the `listings` table, there is a `seller_id` column:
```typescript
sellerId: uuid("seller_id").notNull().references(() => users.id)
```
**There is no separate `sellers` table.** In our platform architecture, a "Seller" is simply a **User** who has created a listing. 

When the user creates the listing, the backend takes their unique User ID (`users.id`) from their login token and saves it into the `seller_id` column of the new listing. 

### Summary
1. The user exists only in the `users` table.
2. The user submits KYC. Admin approves it.
3. The user creates a listing.
4. The database creates a random UUID for the listing itself.
5. The database takes the user's `users.id` and assigns it to the listing's `seller_id` column.

This allows the database to trace every listing back to the exact user who created it, regardless of whether their formal role enum says "BUYER" or "SELLER". (Optionally, depending on business logic, we could automatically upgrade their `role` from `"BUYER"` to `"SELLER"` upon creating their first listing, but it is not strictly required because `seller_id` correctly points to their original user account).
