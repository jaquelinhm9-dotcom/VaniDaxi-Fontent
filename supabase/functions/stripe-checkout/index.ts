import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://jaquelinhm9-dotcom.github.io",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const APP_ORIGIN = "https://jaquelinhm9-dotcom.github.io";
const APP_PATH = "/VaniDaxi-Fontent/";
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function safeReturnUrl(value: unknown, fallback: string) {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    const url = new URL(value);
    if (url.origin !== APP_ORIGIN || url.pathname !== APP_PATH) return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}

function normalizePaymentMethod(value: unknown) {
  const v = String(value || "Tarjeta").trim().toLowerCase();
  if (v.includes("oxxo")) return "oxxo";
  if (v.includes("transfer")) return "transferencia";
  return "tarjeta";
}

function idempotencyKey(prefix: string, orderId: string, paymentMethod?: string) {
  const suffix = paymentMethod ? `-${paymentMethod}` : "";
  return `vanidaxi-${prefix}-${orderId}${suffix}`.slice(0, 255);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!stripeSecret) return json({ error: "Stripe is not configured" }, 503);

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Authentication required" }, 401);
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: userError } = await userClient.auth.getUser(token);
  if (userError || !user) return json({ error: "Invalid authentication" }, 401);

  const body = await req.json().catch(() => null) as { order_id?: string; success_url?: string; cancel_url?: string; payment_method?: string } | null;
  const orderId = body?.order_id;
  const paymentMethod = normalizePaymentMethod(body?.payment_method);
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) return json({ error: "Invalid order_id" }, 400);

  const { data: order, error: orderError } = await supabase.from("orders")
    .select("id,order_number,status,subtotal,discount,shipping_cost,total,shipping_address")
    .eq("id", orderId).eq("user_id", user.id).maybeSingle();
  if (orderError) return json({ error: orderError.message }, 500);
  if (!order) return json({ error: "Order not found" }, 404);
  if (order.status !== "pending") return json({ error: "Order is not payable" }, 409);
  if (!(Number(order.total) > 0)) return json({ error: "Invalid order total" }, 422);

  const { data: items, error: itemsError } = await supabase.from("order_items")
    .select("product_name,quantity,unit_price,total_price")
    .eq("order_id", orderId);
  if (itemsError) return json({ error: itemsError.message }, 500);
  if (!items?.length) return json({ error: "Order has no items" }, 422);

  const subtotalCents = Math.round(Number(order.subtotal || 0) * 100);
  const discountCents = Math.max(0, Math.round(Number(order.discount || 0) * 100));
  const shippingCents = Math.max(0, Math.round(Number(order.shipping_cost || 0) * 100));
  const totalCents = Math.round(Number(order.total || 0) * 100);
  if (discountCents > subtotalCents) return json({ error: "Invalid order discount" }, 409);
  if (subtotalCents - discountCents + shippingCents !== totalCents) return json({ error: "Order total mismatch" }, 409);

  const rawItems = items.map((item) => ({
    name: String(item.product_name || "Producto VaniDaxi").slice(0, 200),
    quantity: Math.max(1, Number(item.quantity || 1)),
    cents: Math.max(0, Math.round(Number(item.unit_price || 0) * 100)),
  }));
  const rawSubtotalCents = rawItems.reduce((sum, item) => sum + item.cents * item.quantity, 0);
  if (rawSubtotalCents !== subtotalCents) return json({ error: "Order item total mismatch" }, 409);

  const successFallback = `${APP_ORIGIN}${APP_PATH}?payment=success&order=${encodeURIComponent(orderId)}`;
  const cancelFallback = `${APP_ORIGIN}${APP_PATH}?payment=cancelled&order=${encodeURIComponent(orderId)}`;
  const successUrl = safeReturnUrl(body?.success_url, successFallback);
  const cancelUrl = safeReturnUrl(body?.cancel_url, cancelFallback);

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);
  params.set("client_reference_id", orderId);
  params.set("metadata[order_id]", orderId);
  params.set("metadata[order_number]", String(order.order_number));
  params.set("metadata[payment_method]", paymentMethod);
  params.set("integration_identifier", "vanidaxiQmNwRtPk");
  if (user.email) params.set("customer_email", user.email);

  // Keep Stripe's dynamic payment-method behavior. The selector expresses the
  // customer's preference by excluding the alternatives rather than hard-coding
  // payment_method_types, so Stripe can still enforce account/country eligibility.
  if (paymentMethod === "oxxo") {
    params.append("excluded_payment_method_types[]", "card");
    params.append("excluded_payment_method_types[]", "customer_balance");
  } else if (paymentMethod === "transferencia") {
    params.append("excluded_payment_method_types[]", "card");
    params.append("excluded_payment_method_types[]", "oxxo");
  } else {
    params.append("excluded_payment_method_types[]", "oxxo");
    params.append("excluded_payment_method_types[]", "customer_balance");
  }

  rawItems.forEach((item, i) => {
    params.set(`line_items[${i}][quantity]`, String(item.quantity));
    params.set(`line_items[${i}][price_data][currency]`, "mxn");
    params.set(`line_items[${i}][price_data][unit_amount]`, String(item.cents));
    params.set(`line_items[${i}][price_data][product_data][name]`, item.name);
  });

  if (shippingCents > 0) {
    const i = rawItems.length;
    params.set(`line_items[${i}][quantity]`, "1");
    params.set(`line_items[${i}][price_data][currency]`, "mxn");
    params.set(`line_items[${i}][price_data][unit_amount]`, String(shippingCents));
    params.set(`line_items[${i}][price_data][product_data][name]`, "Envío VaniDaxi");
  }

  if (discountCents > 0) {
    const couponResponse = await fetch("https://api.stripe.com/v1/coupons", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": idempotencyKey("coupon", orderId),
      },
      body: new URLSearchParams({
        amount_off: String(discountCents),
        currency: "mxn",
        duration: "once",
        name: `VaniDaxi-${String(order.order_number)}`,
      }),
    });
    const coupon = await couponResponse.json();
    if (!couponResponse.ok || !coupon?.id) return json({ error: coupon?.error?.message || "Could not create checkout discount" }, 502);
    params.set("discounts[0][coupon]", coupon.id);
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecret}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": idempotencyKey("checkout", orderId, paymentMethod),
    },
    body: params,
  });
  const stripeData = await stripeResponse.json();
  if (!stripeResponse.ok) return json({ error: stripeData?.error?.message || "Stripe Checkout failed" }, 502);

  const { error: updateError } = await supabase.from("orders").update({ payment_provider: "stripe" }).eq("id", orderId).eq("user_id", user.id);
  if (updateError) return json({ error: "Could not update payment provider" }, 500);
  return json({ checkout_url: stripeData.url, session_id: stripeData.id, order_id: orderId, payment_method: paymentMethod });
});
