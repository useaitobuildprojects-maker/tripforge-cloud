import Stripe from "npm:stripe@17.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const {
      agency_id, service_type, amount, vehicle_id,
      pickup_date, return_date, pickup_location, return_location,
      summary, customer_name, customer_email, customer_phone, customer_notes,
    } = body ?? {};

    if (!agency_id || !service_type || !amount || amount <= 0) throw new Error("Invalid booking payload");
    if (!customer_name || !customer_email || !customer_phone) throw new Error("Customer details required");
    if (!pickup_date || !return_date) throw new Error("Dates required");

    // Insert booking as pending
    const { data: booking, error: bErr } = await admin
      .from("bookings")
      .insert({
        agency_id, vehicle_id: vehicle_id ?? null,
        customer_name, customer_email, customer_phone,
        pickup_date, return_date,
        pickup_location: pickup_location ?? null,
        return_location: return_location ?? null,
        service_type, amount,
        status: "pending",
        payment_status: "pending",
        notes: [summary, customer_notes ? `Customer note: ${customer_notes}` : null].filter(Boolean).join("\n"),
      })
      .select("id, agency_id")
      .single();
    if (bErr || !booking) throw new Error(bErr?.message || "Could not create booking");

    const { data: agency } = await admin
      .from("agencies").select("name, slug").eq("id", agency_id).maybeSingle();

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
    const origin = req.headers.get("origin") || "https://example.com";
    const slug = agency?.slug ?? "";
    const successUrl = `${origin}/agency/${slug}/payment-success?booking=${booking.id}`;
    const cancelUrl = `${origin}/agency/${slug}/payment-cancel?booking=${booking.id}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `${agency?.name ?? "Booking"} — ${service_type}`,
            description: `Booking for ${customer_name}`,
          },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      }],
      metadata: { booking_id: booking.id, agency_id },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    await admin.from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return new Response(JSON.stringify({ url: session.url, booking_id: booking.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (e) {
    console.error("create-booking-checkout error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});