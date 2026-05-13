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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) throw new Error("Not authenticated");

    const { booking_id } = await req.json();
    if (!booking_id) throw new Error("booking_id is required");

    // Service-role client to read full booking + agency
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: booking, error: bErr } = await admin
      .from("bookings")
      .select("id, agency_id, customer_email, customer_name, service_type, amount, currency, payment_status")
      .eq("id", booking_id)
      .maybeSingle();
    if (bErr || !booking) throw new Error("Booking not found");

    // Authorization: caller must be a member of the agency OR super_admin
    const { data: membership } = await admin
      .from("agency_members")
      .select("agency_id")
      .eq("user_id", user.id)
      .eq("agency_id", booking.agency_id)
      .maybeSingle();

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!membership && !roleRow) throw new Error("Forbidden");

    if (booking.payment_status === "paid") throw new Error("Already paid");
    if (!booking.amount || Number(booking.amount) <= 0) throw new Error("Invalid amount");

    const { data: agency } = await admin
      .from("agencies")
      .select("name, slug")
      .eq("id", booking.agency_id)
      .maybeSingle();

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });

    const origin = req.headers.get("origin") || "https://example.com";
    const successUrl = `${origin}/agency/${agency?.slug ?? ""}/admin/bookings?payment=success&booking=${booking.id}`;
    const cancelUrl = `${origin}/agency/${agency?.slug ?? ""}/admin/bookings?payment=cancelled&booking=${booking.id}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: booking.customer_email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: (booking.currency || "eur").toLowerCase(),
            product_data: {
              name: `${agency?.name ?? "Booking"} — ${booking.service_type ?? "service"}`,
              description: `Booking #${booking.id.slice(0, 8)} for ${booking.customer_name}`,
            },
            unit_amount: Math.round(Number(booking.amount) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        agency_id: booking.agency_id,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    await admin
      .from("bookings")
      .update({ stripe_session_id: session.id, payment_status: "pending" })
      .eq("id", booking.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("create-checkout error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});