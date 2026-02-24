import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { stripe, PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent routed to the correct property LLC
 * via Stripe Connect. DK Living takes a 10% management fee.
 *
 * Flow:
 *   Tenant pays $1,700 rent
 *   → Stripe processes payment on DK Living platform
 *   → $170 (10%) goes to DK Living as application_fee
 *   → $1,530 (90%) goes to property LLC connected account
 *   → Stripe processing fees deducted from the property LLC portion
 *
 * Body: { amount: number, unit_id: string, description?: string }
 * Returns: { clientSecret: string, payment_id: string }
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check — get current tenant
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile to verify tenant role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, role, full_name, email")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "tenant") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { amount, unit_id, description } = body;

    if (!amount || !unit_id) {
      return NextResponse.json(
        { error: "amount and unit_id are required" },
        { status: 400 }
      );
    }

    // Validate amount (minimum $1, maximum $10,000)
    const cents = Math.round(amount * 100);
    if (cents < 100 || cents > 1000000) {
      return NextResponse.json(
        { error: "Amount must be between $1.00 and $10,000.00" },
        { status: 400 }
      );
    }

    // Get unit + property info INCLUDING the Stripe Connect account ID
    const { data: unit } = await supabaseAdmin
      .from("units")
      .select("id, unit_number, property_id, properties(id, address, stripe_connect_account_id)")
      .eq("id", unit_id)
      .single();

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    const property = (unit as any).properties;
    const connectAccountId = property?.stripe_connect_account_id;

    if (!connectAccountId) {
      return NextResponse.json(
        { error: "Payment not configured for this property. Contact management." },
        { status: 400 }
      );
    }

    // Calculate DK Living management fee (10%)
    const applicationFeeCents = Math.round(cents * PLATFORM_FEE_PERCENT);

    // Create Stripe PaymentIntent with Connect routing
    const paymentIntent = await stripe.paymentIntents.create({
      amount: cents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      // Route payment to property LLC's connected account
      transfer_data: {
        destination: connectAccountId,
      },
      // DK Living keeps this amount as management fee
      application_fee_amount: applicationFeeCents,
      metadata: {
        tenant_id: user.id,
        unit_id: unit_id,
        unit_number: unit.unit_number || "",
        property_id: property.id,
        property_address: property.address || "",
        description: description || "Rent payment",
        platform_fee_cents: applicationFeeCents.toString(),
        connected_account: connectAccountId,
      },
      receipt_email: profile.email,
      description: `Rent — ${property.address || ""} Unit ${unit.unit_number || ""}`,
    });

    // Create pending payment record in Supabase
    const { data: payment, error: insertError } = await supabaseAdmin
      .from("payments")
      .insert({
        tenant_id: user.id,
        unit_id: unit_id,
        amount: amount,
        platform_fee: amount * PLATFORM_FEE_PERCENT,
        status: "pending",
        stripe_payment_intent_id: paymentIntent.id,
        stripe_connect_account_id: connectAccountId,
        description: description || "Rent payment",
        payment_date: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to create payment record:", insertError);
      // Don't fail — webhook will handle recording if this fails
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      payment_id: payment?.id || null,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
