# 🎫 Stripe Payment Integration Setup (B3.0)

## Overview
This project uses **Stripe** for payment processing in **SANDBOX/TEST MODE** for educational purposes. Real payments will NOT be processed.

---

## 🚀 Quick Setup

### 1. Create Stripe Account
1. Go to https://stripe.com
2. Sign up for a free account
3. **Stay in TEST MODE** (toggle in top-right corner)

### 2. Get Your API Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **test keys**:
   - `pk_test_...` (Publishable key)
   - `sk_test_...` (Secret key)

### 3. Add to Backend `.env`

Add these to `backend/.env`:

```env
# Stripe Configuration (TEST MODE)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

### 4. Share Publishable Key with Teammate C

**IMPORTANT:** Give Teammate C the `STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`) so they can integrate the payment form in the frontend.

**DO NOT share** the secret key (`sk_test_...`) - it should stay in the backend only!

---

## 📖 How It Works

### Payment Flow

```
1. User selects movie and showtime → Frontend
2. POST /bookings/create-payment-intent → Backend creates Stripe payment intent
3. Stripe returns client_secret → Sent to frontend
4. User enters card details → Stripe handles securely
5. Payment succeeds → Frontend calls POST /bookings/confirm-payment
6. Backend verifies with Stripe → Creates booking
7. Confirmation shown to user
```

### API Endpoints

#### 1. `GET /bookings/payment-config` (Get Stripe Key)
**Purpose:** Frontend gets the publishable key

**Request:**
```bash
GET /bookings/payment-config
Authorization: Bearer <token>
```

**Response:**
```json
{
  "publishable_key": "pk_test_...",
  "currency": "eur",
  "country": "FI"
}
```

#### 2. `POST /bookings/create-payment-intent` (Start Payment)
**Purpose:** Initialize payment and reserve seats

**Request:**
```bash
POST /bookings/create-payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "showtime_id": 1,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+358401234567",
  "number_of_seats": 2,
  "total_price": 25.00
}
```

**Response:**
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx",
  "amount": 25.00,
  "currency": "eur",
  "showtime_id": 1,
  "number_of_seats": 2,
  "seats_reserved": true,
  "message": "Payment intent created. Seats temporarily reserved. Complete payment within 10 minutes."
}
```

#### 3. `POST /bookings/confirm-payment` (Finalize Booking)
**Purpose:** Confirm booking after successful payment

**Request:**
```bash
POST /bookings/confirm-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_intent_id": "pi_xxx",
  "showtime_id": 1,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+358401234567",
  "number_of_seats": 2,
  "total_price": 25.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking confirmed successfully! Payment received.",
  "booking": {
    "booking_id": 123,
    "user_id": 1,
    "showtime_id": 1,
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "number_of_seats": 2,
    "total_price": 25.00,
    "status": "confirmed",
    "payment_status": "completed",
    "payment_method": "stripe",
    "created_at": "2025-11-30T..."
  }
}
```

#### 4. `DELETE /bookings/:id` (Cancel with Refund)
**Purpose:** Cancel booking and automatically refund Stripe payment

**Request:**
```bash
DELETE /bookings/123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Booking cancelled successfully. Refund will be processed if applicable.",
  "booking": {
    "booking_id": 123,
    "status": "cancelled",
    "payment_status": "refunded"
  }
}
```

---

## 🧪 Testing with Test Cards

Use these Stripe test cards (no real money):

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | ✅ Successful payment |
| `4000 0000 0000 9995` | ❌ Insufficient funds |
| `4000 0000 0000 0002` | ❌ Card declined |

- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

---

## 🔒 Security Features

### Implemented:
- ✅ Payment processing handled by Stripe (PCI compliant)
- ✅ Price verification on backend (prevent client tampering)
- ✅ Seat reservation during payment
- ✅ Transaction-based booking creation
- ✅ Automatic refunds on cancellation
- ✅ Payment intent verification before booking

### For Production (optional):
- Webhook signature verification (code included)
- Payment timeout logic
- Idempotency keys
- More robust error handling

---

## 📊 Monitoring Payments

### Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/payments
2. See all test payments
3. View payment details
4. Manual refunds if needed

### Database
All payments are stored in the `payments` table:
```sql
SELECT * FROM payments 
WHERE payment_method = 'stripe' 
ORDER BY created_at DESC;
```

---

## 🎓 For Teammate C (Frontend)

### You need to:
1. Get `STRIPE_PUBLISHABLE_KEY` from Teammate B
2. Install Stripe in frontend: `npm install @stripe/stripe-js @stripe/react-stripe-js`
3. Call `GET /bookings/payment-config` to get the key
4. Use Stripe Elements to collect card details
5. Call our two-step API:
   - `POST /bookings/create-payment-intent`
   - `POST /bookings/confirm-payment`

### Example frontend flow:
```javascript
// 1. Get payment config
const config = await fetch('/bookings/payment-config');
const { publishable_key } = await config.json();

// 2. Load Stripe
const stripe = await loadStripe(publishable_key);

// 3. Create payment intent
const response = await fetch('/bookings/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({ showtime_id, seats, price, ... })
});
const { client_secret } = await response.json();

// 4. Confirm payment with Stripe
const { error } = await stripe.confirmCardPayment(client_secret, {
  payment_method: { card: cardElement }
});

// 5. If successful, confirm booking
await fetch('/bookings/confirm-payment', {
  method: 'POST',
  body: JSON.stringify({ payment_intent_id, ... })
});
```

---

## ❓ FAQ

**Q: Will real money be charged?**  
A: No! We're using TEST MODE. Only test card numbers work.

**Q: Do I need to activate my Stripe account?**  
A: No! Test mode works immediately after signup.

**Q: Can users see our Stripe key?**  
A: Only the publishable key (`pk_test_...`), which is safe. The secret key stays on the server.

**Q: What if payment succeeds but booking fails?**  
A: The code handles this, but in production you'd log it and issue a refund.

**Q: How do I test refunds?**  
A: Make a booking, then cancel it. Check Stripe dashboard for the refund.

---

## 📝 Summary for Presentation

"We integrated **Stripe** payment processing in **sandbox mode** for our booking system. The implementation uses a two-step flow: first creating a payment intent to reserve seats, then confirming the booking after successful payment. All card processing is handled securely by Stripe, and we've implemented automatic refunds for cancellations. The system includes price verification, seat locking during payment, and comprehensive error handling."

---

**Created:** Week 3, Task B3.0  
**Status:** ✅ Complete (Sandbox/Test Mode)  
**Teammate B** delivers the backend integration  
**Teammate C** implements the frontend payment form

