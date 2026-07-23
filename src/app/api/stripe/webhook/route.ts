import type Stripe from "stripe";
import { NextResponse, type NextRequest } from "next/server";
import { tierForPriceId } from "@/lib/billing/plans";
import { getStripe } from "@/lib/billing/stripe";
import { prisma } from "@/lib/db";

/**
 * Stripe webhook — the ONLY place a paid entitlement is granted or revoked.
 *
 * Server actions start a checkout; they never touch `tier`. The reason is that
 * only Stripe knows whether money actually moved: a user can abandon Checkout,
 * a card can fail on renewal, a subscription can be cancelled from the Billing
 * Portal. All of those arrive here as events, and this handler is what reconciles
 * `User.tier` to the truth.
 *
 * Node runtime: signature verification uses Node crypto, and this must never be
 * cached or prerendered. The proxy matcher already excludes /api, so no CSP or
 * auth-redirect logic runs against this path.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Statuses that should hold a paid plan. past_due is included as a grace window
// — access survives a failed renewal until Stripe gives up and cancels, which
// arrives as its own event and downgrades below.
const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[stripe] webhook hit but STRIPE_WEBHOOK_SECRET is unset");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  // Raw body, exactly as sent — constructEvent recomputes the HMAC over it, so
  // any parsing/re-serialisation would break verification.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    // Bad signature = not from Stripe (or a replay with a stale secret). 400 so
    // Stripe marks it failed; never process an unverified payload.
    console.error("[stripe] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // Idempotency: record the event id first. A duplicate (Stripe retries on any
  // non-2xx, and at-least-once delivery is normal) collides on the PK and we
  // ack without re-applying — which stops, e.g., a retried `deleted` from
  // downgrading an account the user has since re-subscribed to.
  try {
    await prisma.stripeEvent.create({
      data: { id: event.id, type: event.type },
    });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // The session confirms payment but carries no price; fetch the real
        // subscription and reconcile from it.
        if (session.subscription) {
          const sub = await getStripe().subscriptions.retrieve(
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id,
          );
          await applySubscription(sub, session.client_reference_id);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      // paused/resumed carry a status (paused | active) that applySubscription
      // already maps to the right tier, so route them through the same path
      // rather than trusting a separate `.updated` to also fire.
      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        await applySubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        // Everything else (invoices, payment_intents, …) is acked and ignored.
        break;
    }
  } catch (error) {
    // Processing failed after we recorded the id. Drop the ledger row so
    // Stripe's retry is allowed to re-run, and 500 so a retry is scheduled.
    console.error("[stripe] handler failed", event.type, error);
    await prisma.stripeEvent.delete({ where: { id: event.id } }).catch(() => {});
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Reconcile one subscription onto its owner's account. Resolves the user by our
 * own metadata/reference first, falling back to the Stripe customer id we
 * stored at checkout. Grants the price's tier while the sub is active-ish;
 * drops to free otherwise. An unrecognised price on an active sub fails closed
 * — stripe.* fields are updated but `tier` is left untouched and logged, so a
 * stray price can never silently escalate access.
 */
async function applySubscription(
  sub: Stripe.Subscription,
  clientReferenceId?: string | null,
): Promise<void> {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userId = sub.metadata?.userId || clientReferenceId || null;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(userId ? [{ id: userId }] : []),
        { stripeCustomerId: customerId },
      ],
    },
    select: { id: true, tier: true, tierSince: true },
  });

  if (!user) {
    console.error(
      "[stripe] no user for subscription",
      sub.id,
      "customer",
      customerId,
    );
    return;
  }

  // In this API version price and period-end live on the item, not the sub.
  const item = sub.items.data[0];
  const priceId = item?.price?.id ?? null;
  const periodEnd = item?.current_period_end ?? null;

  const resolvedTier = priceId ? tierForPriceId(priceId) : null;

  const data: Record<string, unknown> = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    stripePriceId: priceId,
    stripeStatus: sub.status,
    stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
  };

  if (ACTIVE_STATUSES.has(sub.status)) {
    if (resolvedTier) {
      data.tier = resolvedTier;
      // Preserve the original upgrade date across renewals/plan changes.
      data.tierSince = user.tierSince ?? new Date();
      data.tierNote = `stripe:${sub.status}`;
    } else {
      console.error(
        "[stripe] active subscription with unknown price",
        priceId,
        "— leaving tier as",
        user.tier,
      );
    }
  } else {
    // canceled | unpaid | incomplete_expired | incomplete | paused → no access.
    data.tier = "free";
    data.tierSince = null;
    data.tierNote = `stripe:${sub.status}`;
  }

  await prisma.user.update({ where: { id: user.id }, data });
}
