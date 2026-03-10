# Phase 7 Testing Guide: Deal Room Engine

This guide provides step-by-step cURL commands to test the Deal Room Engine developed in Phase 7. The Deal Room is automatically created when a seller accepts a buyer's offer.

## Prerequisites

Assuming you already have:
1. A registered and logged-in `BUYER` (Token: `$BUYER_TOKEN`)
2. A registered and logged-in `SELLER` (Token: `$SELLER_TOKEN`)
3. A registered and logged-in `ADMIN` (Token: `$ADMIN_TOKEN`, Role: `ADMIN`)
4. An `OFFER_ID` that the buyer made on the seller's listing.
5. The `DEAL_ROOM_ID` (obtained after the offer is accepted).

Set these environment variables in your terminal to easily run the commands:

```bash
export BUYER_TOKEN="your_buyer_jwt_token"
export SELLER_TOKEN="your_seller_jwt_token"
export ADMIN_TOKEN="your_admin_jwt_token"
export OFFER_ID="your_offer_id"
export DEAL_ROOM_ID="your_deal_room_id"
export TASK_ID="your_task_id"
```

---

## 1. Auto-Create Deal Room (Seller Accepts Offer)

When the seller accepts the offer, a Deal Room is automatically created along with default checklist tasks.

```bash
curl -X PATCH http://localhost:8000/seller/offers/$OFFER_ID/respond \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACCEPTED"
  }'
```
*Response will include the newly created `dealRoom` object.* **Extract the `id` from the response and set `$DEAL_ROOM_ID`.**

---

## 2. List Deal Rooms (Buyer or Seller)

Lists all deal rooms that the authenticated user is a participant in (either as a buyer or seller).

**Request (as Buyer):**
```bash
curl -X GET http://localhost:8000/deal-rooms \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

---

## 3. Get Specific Deal Room Details

Fetch a specific deal room along with its checklist tasks and escrow transactions.

**Request (as Seller):**
```bash
curl -X GET http://localhost:8000/deal-rooms/$DEAL_ROOM_ID \
  -H "Authorization: Bearer $SELLER_TOKEN"
```
*Note the `tasks` array. Grab one of the task IDs assigned to the seller and set `$TASK_ID`.*

---

## 4. Add a Custom Task to Checklist

Add a new checklist task to the deal room. The user adding the task specifies who it is assigned to (`BUYER` or `SELLER`).

**Request (as Buyer):**
```bash
curl -X POST http://localhost:8000/deal-rooms/$DEAL_ROOM_ID/tasks \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Upload final code repository archive",
    "assignedTo": "SELLER"
  }'
```

---

## 5. Complete a Checklist Task

Only the user assigned to the task (`assignedTo`) can complete it.

**Request (as Seller marking their task complete):**
```bash
curl -X PATCH http://localhost:8000/deal-rooms/tasks/$TASK_ID/complete \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

---

## 6. Update Deal Room Status (State Machine)

Progress the deal room to the next stage. e.g. `INITIATED` -> `ESCROW_PENDING`.

**Request (as Buyer):**
```bash
curl -X PATCH http://localhost:8000/deal-rooms/$DEAL_ROOM_ID/status \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ESCROW_PENDING"
  }'
```

---

## 7. Process Escrow Webhook (Webhook Simulation)

This simulates an external escrow provider (like Escrow.com or Stripe) sending a webhook when funds are received.
*Note: This route is unauthenticated but requires a valid HMAC signature in the headers using your `ESCROW_WEBHOOK_SECRET` defined in `.env`*.

To easily test this locally, you can temporarily comment out the signature validation block in `DealRoomController.escrowWebhook`, OR generate a valid signature using a script.

**Assuming validation is bypassed locally for testing:**
```bash
curl -X POST http://localhost:8000/webhooks/escrow \
  -H "Content-Type: application/json" \
  -H "x-escrow-signature: bypassed_for_local_test" \
  -d '{
    "dealRoomId": "'$DEAL_ROOM_ID'",
    "provider": "ESCROW_COM",
    "externalId": "esc_1234567890",
    "amount": 50000,
    "status": "FUNDED"
  }'
```
*The listing status will automatically change to `LOCKED` and the deal room status to `ESCROW_FUNDED`.*

---

## 8. Confirm Asset Receipt (Dual Approval Release)

Once all SELLER tasks are complete, the BUYER confirms receipt of the assets. This moves the deal room to `COMPLETED` and the listing to `SOLD`.

*(Ensure the deal room status is manually updated to `AWAITING_CONFIRMATION` before running this, and all SELLER tasks are complete)*:

```bash
# Set status to AWAITING_CONFIRMATION
curl -X PATCH http://localhost:8000/deal-rooms/$DEAL_ROOM_ID/status \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "AWAITING_CONFIRMATION"}'

# Buyer confirms receipt
curl -X POST http://localhost:8000/deal-rooms/$DEAL_ROOM_ID/escrow/confirm-receipt \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

---

## 9. Admin Override Status (Fallback)

If a deal gets stuck, an ADMIN can override the state machine strictly. This action is heavily audited.

**Request (as Admin):**
```bash
curl -X PATCH http://localhost:8000/admin/deal-rooms/$DEAL_ROOM_ID/override-status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "reason": "Buyer unresponsive for 14 days, terms met by seller."
  }'
```

---

## 10. Admin Release Escrow (Manual Intervention)

Admin manually triggers the escrow release if the deal is completed but the webhook failed or buyer is fully unresponsive.

**Request (as Admin):**
```bash
curl -X POST http://localhost:8000/admin/deal-rooms/$DEAL_ROOM_ID/release-escrow \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Resolving dispute #994. Releasing funds to seller."
  }'
```

---

## 11. Cancel Deal Room

Cancels the transaction before completion.

**Request (as Buyer or Seller):**
```bash
curl -X POST http://localhost:8000/deal-rooms/$DEAL_ROOM_ID/cancel \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Seller unable to provide original domain registrar credentials."
  }'
```
