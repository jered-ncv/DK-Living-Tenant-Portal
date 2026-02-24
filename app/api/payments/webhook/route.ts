import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Stripe from "stripe";

/**
 * POST /api/payments/webhook
 * Handles Stripe webhook events for Connect payments.
 *
 * Configure in Stripe Dashboard → Developers → Webhooks
 * Endpoint URL: https://your-domain.vercel.app/api/payments/webhook
 * Events to listen for:
 *   - payment_intent.succeeded
 *   - payment_intent.payment_failed
 *
 * IMPORTANT: This webhook fires on the PLATFORM account (DK Living).
 * Connect payments show up here with transfer_data in the metadata.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const {
    tenant_id,
    unit_id,
    property_id,
    platform_fee_cents,
    connected_account,
  } = paymentIntent.metadata;

  // Update existing pending record OR create new one (idempotent)
  const { data: existing } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .single();

  const paymentData = {
    status: "completed" as const,
    stripe_charge_id: paymentIntent.latest_charge as string,
    completed_at: new Date().toISOString(),
  };

  if (existing) {
    await supabaseAdmin
      .from("payments")
      .update(paymentData)
      .eq("id", existing.id);
  } else {
    // Payment record wasn't created during intent — create it now
    await supabaseAdmin.from("payments").insert({
      tenant_id: tenant_id,
      unit_id: unit_id,
      amount: paymentIntent.amount / 100,
      platform_fee: platform_fee_cents
        ? parseInt(platform_fee_cents) / 100
        : 0,
      status: "completed",
      stripe_payment_intent_id: paymentIntent.id,
      stripe_charge_id: paymentIntent.latest_charge as string,
      stripe_connect_account_id: connected_account || null,
      description: paymentIntent.metadata.description || "Rent payment",
      payment_date: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });
  }

  const amountDollars = paymentIntent.amount / 100;
  const feeDollars = platform_fee_cents
    ? parseInt(platform_fee_cents) / 100
    : 0;

  console.log(
    `Payment succeeded: ${paymentIntent.id} — $${amountDollars} from tenant ${tenant_id} ` +
      `(DK Living fee: $${feeDollars}, property receives: $${amountDollars - feeDollars})`
  );

  // TODO: Post payment to QuickBooks via QBO API integration (P3)
  // Need to post to BOTH the property LLC's QBO and DK Living's QBO
  // await postPaymentToQBO(paymentIntent, property_id, feeDollars);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { data: existing } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .single();

  if (existing) {
    await supabaseAdmin
      .from("payments")
      .update({
        status: "failed",
        failure_reason:
          paymentIntent.last_payment_error?.message || "Payment failed",
      })
      .eq("id", existing.id);
  }

  console.log(
    `Payment failed: ${paymentIntent.id} — ${paymentIntent.last_payment_error?.message}`
  );
}

// Required: tell Next.js not to parse the body (Stripe needs raw body for signature verification)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
