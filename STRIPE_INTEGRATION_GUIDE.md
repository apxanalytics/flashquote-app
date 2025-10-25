  # Stripe Payment Integration Guide

## Overview

ContractorAI is integrated with Stripe for payment processing, invoicing, and contractor payouts. This enables customers to pay invoices online and contractors to receive direct deposits to their bank accounts.

## Setup Instructions

### 1. Get Stripe API Keys

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Navigate to **Dashboard → Developers → API keys**
3. Copy your keys:
   - **Publishable key**: `pk_test_...` (for frontend)
   - **Secret key**: `sk_test_...` (for backend)
4. Add to `.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

5. Add secret key to Supabase Edge Functions environment variables:
   - Go to Supabase Dashboard → Edge Functions → Environment Variables
   - Add `STRIPE_SECRET_KEY` = `sk_test_your_secret_key`

### 2. Configure Stripe Webhooks

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `payout.paid`
   - `payout.failed`
5. Copy the **Signing secret** (`whsec_...`)
6. Add to Supabase environment variables:
   - `STRIPE_WEBHOOK_SECRET` = `whsec_your_webhook_secret`

### 3. Enable Stripe Connect

1. Go to **Stripe Dashboard → Connect → Settings**
2. Enable **Express accounts**
3. Add branding (logo, colors, etc.)
4. Set up platform fee (recommended: 2.9%)

### 4. Deploy Edge Functions

The following Edge Functions handle Stripe operations:

```bash
# Deploy all Stripe functions
supabase functions deploy create-stripe-account
supabase functions deploy create-stripe-onboarding-link
supabase functions deploy create-payment-intent
supabase functions deploy create-payment-link
supabase functions deploy stripe-webhook
```

## Architecture

### Database Schema

**Stripe fields added to `contractor_profiles`:**
- `stripe_account_id` - Connect account ID
- `stripe_account_status` - Connection status
- `stripe_charges_enabled` - Can accept payments
- `stripe_payouts_enabled` - Can receive payouts
- `stripe_onboarding_completed_at` - Completion timestamp

**Stripe fields added to `invoices`:**
- `stripe_payment_intent_id` - Payment intent ID
- `stripe_payment_link` - Payment link URL
- `payment_method` - card, bank_transfer, etc.
- `payment_metadata` - Additional payment data
- `balance_due` - Amount remaining
- `amount_paid` - Amount already paid

**New tables:**
- `payment_transactions` - Payment history and details
- `payout_records` - Contractor payout tracking

### Payment Flow

#### Option 1: Payment Links (Simpler)

1. **Contractor creates invoice**
2. **Generate payment link**: Call `create-payment-link` Edge Function
3. **Share link**: SMS/email link to customer
4. **Customer pays**: Clicks link, enters card details on Stripe-hosted page
5. **Webhook processes**: `payment_intent.succeeded` updates invoice to paid
6. **Funds transfer**: Money goes directly to contractor's Stripe account

#### Option 2: Embedded Payment Form (More Control)

1. **Customer visits payment page**
2. **Create payment intent**: Call `create-payment-intent` Edge Function
3. **Show payment form**: Display Stripe Elements card form
4. **Process payment**: Submit card details to Stripe
5. **Webhook processes**: Update invoice status
6. **Redirect to success page**

### Contractor Onboarding Flow

1. **Create Stripe Connect account**: Call `create-stripe-account`
2. **Generate onboarding link**: Call `create-stripe-onboarding-link`
3. **Redirect contractor**: Send to Stripe onboarding (verify identity, add bank account)
4. **Return to app**: After completion, contractor can accept payments
5. **Webhook updates status**: `account.updated` event enables payment collection

## Usage Examples

### Frontend Integration

#### 1. Connect Stripe Account (Contractor)

```typescript
import { stripeService } from './lib/stripeService';

async function connectStripe() {
  try {
    // Create or retrieve Stripe account
    const account = await stripeService.createStripeAccount();

    // Generate onboarding link
    const { url } = await stripeService.createOnboardingLink(
      window.location.origin + '/dashboard/settings?stripe=success',
      window.location.origin + '/dashboard/settings?stripe=refresh'
    );

    // Redirect to Stripe onboarding
    window.location.href = url;
  } catch (error) {
    console.error('Failed to connect Stripe:', error);
  }
}
```

#### 2. Check Stripe Status

```typescript
const status = await stripeService.getStripeAccountStatus();

if (!status.connected) {
  // Show "Connect Stripe" button
} else if (status.requiresAction) {
  // Show "Complete Stripe Setup" button
} else {
  // Stripe is fully connected
}
```

#### 3. Generate Payment Link (Simple)

```typescript
async function sendInvoiceWithPaymentLink(invoiceId: string) {
  try {
    const { url } = await stripeService.createPaymentLink(invoiceId);

    // Share this URL with customer via SMS/email
    console.log('Payment link:', url);

    // Or copy to clipboard
    navigator.clipboard.writeText(url);
  } catch (error) {
    console.error('Failed to create payment link:', error);
  }
}
```

#### 4. Embedded Payment Form (Advanced)

```typescript
import PaymentForm from './components/PaymentForm';

<PaymentForm
  invoiceId={invoice.id}
  invoiceNumber={invoice.invoice_number}
  amount={invoice.balance_due}
  customerName={invoice.customer.name}
  customerEmail={invoice.customer.email}
  onSuccess={() => {
    // Redirect to success page
    navigate(`/invoice/${invoice.id}/success`);
  }}
  onCancel={() => {
    // Close modal or go back
  }}
/>
```

#### 5. View Payment History

```typescript
const transactions = await stripeService.getPaymentTransactions(50);

transactions.forEach(tx => {
  console.log(`${tx.invoice.invoice_number}: $${tx.amount} (${tx.status})`);
});
```

#### 6. View Payout Records

```typescript
const payouts = await stripeService.getPayoutRecords(50);

payouts.forEach(payout => {
  console.log(`Payout ${payout.stripe_payout_id}: $${payout.amount}`);
  console.log(`Status: ${payout.status}, Arrival: ${payout.arrival_date}`);
});
```

#### 7. Calculate Revenue

```typescript
const revenue = await stripeService.calculateRevenue(
  new Date('2025-01-01'),
  new Date('2025-12-31')
);

console.log(`Total Revenue: $${revenue.totalRevenue}`);
console.log(`Stripe Fees: $${revenue.totalFees}`);
console.log(`Net Revenue: $${revenue.netRevenue}`);
console.log(`Transactions: ${revenue.transactionCount}`);
```

## Edge Functions API

### 1. create-stripe-account

**Creates or retrieves Stripe Connect account**

**Endpoint:** `POST /functions/v1/create-stripe-account`

**Auth:** Required (Bearer token)

**Response:**
```json
{
  "accountId": "acct_xxxxx",
  "chargesEnabled": false,
  "payoutsEnabled": false
}
```

### 2. create-stripe-onboarding-link

**Generates onboarding link for Stripe Connect**

**Endpoint:** `POST /functions/v1/create-stripe-onboarding-link`

**Auth:** Required

**Body:**
```json
{
  "returnUrl": "https://app.com/settings?success=true",
  "refreshUrl": "https://app.com/settings?refresh=true"
}
```

**Response:**
```json
{
  "url": "https://connect.stripe.com/setup/..."
}
```

### 3. create-payment-intent

**Creates payment intent for invoice payment**

**Endpoint:** `POST /functions/v1/create-payment-intent`

**Auth:** Not required (public endpoint)

**Body:**
```json
{
  "invoiceId": "uuid"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxxxx"
}
```

### 4. create-payment-link

**Creates Stripe-hosted payment link**

**Endpoint:** `POST /functions/v1/create-payment-link`

**Auth:** Required

**Body:**
```json
{
  "invoiceId": "uuid"
}
```

**Response:**
```json
{
  "url": "https://pay.stripe.com/pay/...",
  "id": "plink_xxxxx"
}
```

### 5. stripe-webhook

**Handles Stripe webhook events**

**Endpoint:** `POST /functions/v1/stripe-webhook`

**Auth:** Not required (validated by signature)

**Headers:** Must include `stripe-signature`

## Webhook Events Handled

### payment_intent.succeeded
- Updates invoice status to `paid`
- Records payment transaction
- Logs activity
- Sends notification to contractor

### payment_intent.payment_failed
- Updates invoice status to `overdue`
- Records failed transaction
- Logs failure reason

### account.updated
- Updates contractor profile with account status
- Enables/disables payment collection

### payout.paid
- Records successful payout
- Updates payout status

### payout.failed
- Records failed payout
- Logs failure message

## Security

### Row Level Security (RLS)

All Stripe-related tables have RLS enabled:
- Contractors can only see their own payment transactions
- Contractors can only see their own payout records
- Public can't access Stripe account IDs directly

### API Key Protection

- **Publishable key**: Safe to use in frontend (read-only)
- **Secret key**: Never exposed to frontend (stored in Edge Functions env)
- **Webhook secret**: Validates webhook authenticity

### Payment Security

- Card details never touch our servers
- Stripe handles PCI compliance
- 3D Secure authentication when required
- Fraud detection by Stripe Radar

## Testing

### Test Mode

Use test API keys for development:
- `pk_test_...` for frontend
- `sk_test_...` for backend

### Test Cards

Use these test cards in Stripe test mode:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

Any future expiry date and any CVC will work.

### Testing Webhooks

1. Use Stripe CLI to forward webhooks locally:
   ```bash
   stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
   ```

2. Trigger test events:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

## Platform Fees

The platform takes a 2.9% fee on each transaction:
- **Customer pays**: $100
- **Stripe fee**: ~$3 (Stripe's fee)
- **Platform fee**: $2.90 (2.9%)
- **Contractor receives**: ~$94.10

Adjust `application_fee_amount` in payment intent creation to change fee.

## Going Live

### Pre-launch Checklist

- [ ] Switch to live API keys (`pk_live_...`, `sk_live_...`)
- [ ] Update webhook endpoint to production URL
- [ ] Test with real (small) transactions
- [ ] Verify contractor payouts work
- [ ] Set up Stripe account notifications
- [ ] Configure payout schedule (daily, weekly, monthly)
- [ ] Add business information to Stripe account
- [ ] Review and accept Stripe Terms of Service

### Production Configuration

1. Update `.env` with live keys
2. Update Supabase Edge Functions environment variables
3. Configure production webhook endpoint
4. Test end-to-end payment flow
5. Monitor Stripe Dashboard for issues

## Troubleshooting

### Common Issues

**Issue:** "Stripe account not connected"
**Solution:** Contractor needs to complete Stripe onboarding

**Issue:** "Payment intent creation failed"
**Solution:** Check contractor has active Stripe Connect account

**Issue:** "Webhook signature verification failed"
**Solution:** Verify STRIPE_WEBHOOK_SECRET is correct

**Issue:** "Payment succeeded but invoice not updated"
**Solution:** Check webhook is configured and receiving events

### Debug Mode

Enable Stripe debug logging:
```typescript
import { Stripe } from 'stripe';

const stripe = new Stripe(apiKey, {
  apiVersion: '2024-10-28.acacia',
  maxNetworkRetries: 2,
  timeout: 30000,
});
```

## Support

For Stripe-specific issues:
- Check [Stripe Dashboard](https://dashboard.stripe.com) logs
- Review webhook event logs
- Contact Stripe Support for payment issues

For integration issues:
- Check Supabase Edge Function logs
- Review database for payment transaction records
- Verify environment variables are set correctly

## Summary

✅ Full Stripe integration complete
✅ Stripe Connect for contractor payouts
✅ Payment Links for easy payments
✅ Embedded payment forms
✅ Webhook handling for automation
✅ Payment transaction tracking
✅ Payout records and history
✅ Revenue calculations
✅ Test mode ready
✅ Production-ready architecture

The app now supports full payment processing with direct deposits to contractors!
