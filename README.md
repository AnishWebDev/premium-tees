# Premium Tees

Production e-commerce storefront — Next.js 15, Prisma (Postgres), Auth.js, Razorpay (India UPI / cards).

## Vercel env vars (real customers)

| Key | Required | Where to get it |
|---|---|---|
| `DATABASE_URL` | Yes | Neon / Supabase / Vercel Postgres |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `RAZORPAY_KEY_ID` | Yes | [Razorpay API Keys](https://dashboard.razorpay.com/app/keys) |
| `RAZORPAY_KEY_SECRET` | Yes | Same Razorpay page |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Same as `RAZORPAY_KEY_ID` |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Razorpay → Webhooks → secret |
| `NEXT_PUBLIC_APP_URL` | Recommended | `https://your-domain.com` (no trailing slash) |
| `AUTH_URL` | Recommended | Same as app URL (no trailing slash) |
| `RESEND_API_KEY` | For invoices | [Resend API keys](https://resend.com/api-keys) |
| `EMAIL_FROM` | For invoices | Verified sender, e.g. `Premium Tees <orders@yourdomain.com>` |
| `ORDER_NOTIFY_EMAIL` | Recommended | Your inbox — BCC copy of every order invoice |
| `CLOUDINARY_*` | No | Only for admin image uploads |

Orders stay `PENDING` until Razorpay payment is verified (Checkout handler) or via webhook (`payment.captured`).

When payment succeeds, the customer gets an invoice email and `ORDER_NOTIFY_EMAIL` gets a BCC copy (if Resend is configured).

### Fulfillment helpers

- **Packing slip / ship label:** Admin → Orders → **Pack** (or `/admin/orders/[id]/print`) → Print
- **Tracking + shipped email:** set status to **Shipped** and enter carrier/tracking
- **Returns:** customers request from order history; admin reviews at `/admin/returns`

### Razorpay webhook

Endpoint: `https://your-domain.com/api/webhooks/razorpay`  
Events: `payment.captured` (optionally `payment.authorized`)

### Seed (once)

```bash
DATABASE_URL="your-postgres-url" npx prisma db push
DATABASE_URL="your-postgres-url" npm run db:seed
```

If products still show USD-like prices (~38–85), convert once:

```bash
DATABASE_URL="your-postgres-url" npx tsx scripts/convert-prices-to-inr.ts
```

## Local setup

```bash
cp .env.example .env   # fill DATABASE_URL + Razorpay test keys + AUTH_SECRET
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Demo accounts (after seed)

| Role | Email | Password | Access |
|---|---|---|---|
| SuperAdmin | `superadmin@premiumtees.com` | `SuperAdmin123!` | All admin tools + Staff roles, hard-delete products, system status |
| Admin | `admin@premiumtees.com` | `Admin123!` | Products, orders, content, site style, returns (no staff / hard delete) |
| Guest | `guest@premiumtees.com` | `Guest1234!` | Shop, cart, checkout, orders, returns |

Until Razorpay is configured, **Admin / SuperAdmin** can still place dummy paid orders at checkout. Guests and regular customers are blocked until payment keys are added.
