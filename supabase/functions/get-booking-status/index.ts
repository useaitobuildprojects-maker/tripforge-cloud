const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { createClient } = await import("npm:@supabase/supabase-js@2.45.0");
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { booking_id } = body ?? {};
    if (!booking_id) throw new Error("booking_id is required");

    const { data: booking, error } = await admin
      .from("bookings")
      .select("id, status, payment_status, amount, customer_name, service_type, pickup_date, return_date, paid_at")
      .eq("id", booking_id)
      .maybeSingle();

    if (error) throw error;
    if (!booking) throw new Error("Booking not found");

    return new Response(JSON.stringify({ booking }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("get-booking-status error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
