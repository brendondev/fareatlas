"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import {
  type BillingInterval,
  type PaidTier,
  isBillingConfigured,
  PAID_TIERS,
  priceIdFor,
} from "@/lib/billing/plans";
import { getStripe } from "@/lib/billing/stripe";
import { siteUrl } from "@/lib/site-url";

/**
 * Billing server actions: start a subscription (Checkout) and manage an
 * existing one (Billing Portal). Both are POSTs from a form, both require a
 * signed-in user, and both hand off to a Stripe-hosted page via redirect().
 *
 * The client never sends a price ID. It sends a (tier, interval) the app
 * resolves to a price server-side — so a tampered form can only ever pick one
 * of the two plans we actually sell, not an arbitrary Stripe price.
 *
 * Neither action grants anything. Entitlement changes happen only in the
 * webhook, once Stripe confirms payment — see app/api/stripe/webhook. A user
 * who abandons Checkout, or whose card later fails, is never upgraded here.
 */

function toPaidTier(value: FormDataEntryValue | null): PaidTier | null {
  return typeof value === "string" && (PAID_TIERS as readonly string[]).includes(value)
    ? (value as PaidTier)
    : null;
}

function toInterval(value: FormDataEntryValue | null): BillingInterval | null {
  return value === "month" || value === "year" ? value : null;
}

/**
 * Returns the user's Stripe customer id, creating (and persisting) one the
 * first time. Idempotent per account: the id is stored on User, so repeat
 * checkouts reuse the same customer rather than spawning duplicates that split
 * a person's billing history across records.
 */
async function ensureCustomer(user: {
  id: string;
  email: string;
  name: string | null;
}): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });
  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email: user.email,
    name: user.name ?? undefined,
    // The join key the webhook falls back to if a payload lacks our metadata.
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

export async function startCheckout(formData: FormData): Promise<void> {
  if (!isBillingConfigured()) redirect("/pricing");

  const { user } = await requireUser("/pricing");
  const tier = toPaidTier(formData.get("tier"));
  const interval = toInterval(formData.get("interval"));

  if (!tier || !interval) redirect("/pricing?checkout=invalid");

  const priceId = priceIdFor(tier, interval);
  if (!priceId) redirect("/pricing?checkout=unavailable");

  const customerId = await ensureCustomer(user!);
  const base = siteUrl();

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    // Both a top-level reference and subscription metadata: the webhook can key
    // off whichever the event type carries.
    client_reference_id: user!.id,
    subscription_data: { metadata: { userId: user!.id, tier } },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${base}/account?checkout=success`,
    cancel_url: `${base}/pricing?checkout=cancelled`,
  });

  if (!session.url) redirect("/pricing?checkout=error");
  redirect(session.url);
}

export async function openBillingPortal(): Promise<void> {
  if (!isBillingConfigured()) redirect("/pricing");

  const { user } = await requireUser("/account");
  const record = await prisma.user.findUnique({
    where: { id: user!.id },
    select: { stripeCustomerId: true },
  });

  // No customer means nothing to manage — send them to pick a plan instead.
  if (!record?.stripeCustomerId) redirect("/pricing");

  const session = await getStripe().billingPortal.sessions.create({
    customer: record!.stripeCustomerId!,
    return_url: `${siteUrl()}/account`,
  });

  redirect(session.url);
}
