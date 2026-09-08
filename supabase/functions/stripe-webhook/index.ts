import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(secret: string, payload: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function verifySignature(payload: string, header: string, secret: string) {
  const parts = header.split(",");
  const timestamp = parts.find(x => x.startsWith("t="))?.slice(2);
  const signatures = parts.filter(x => x.startsWith("v1=")).map(x => x.slice(3));
  if (!timestamp || !signatures.length) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;
  const expected = await hmac(secret, `${timestamp}.${payload}`);
  return signatures.some(sig => timingSafeEqual(sig, expected));
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

Deno.serve(async req => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!webhookSecret) return new Response("Stripe webhook is not configured", { status: 503 });

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  if (!(await verifySignature(payload, signature, webhookSecret))) return new Response("Invalid signature", { status: 400 });

  let event: any;
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const type = String(event?.type || "");
  const session = event?.data?.object;
  const orderId = session?.metadata?.order_id || session?.client_reference_id;
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) return json({ received: true });

  if (type === "checkout.session.completed" && session.payment_status === "paid") {
    const { error } = await supabase
      .from("orders")
      .update({ status: "paid", payment_provider: "stripe", payment_id: session.payment_intent || session.id, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("status", "pending");
    if (error) return json({ error: "Could not mark order paid" }, 500);
  } else if (type === "checkout.session.async_payment_succeeded") {
    const { error } = await supabase
      .from("orders")
      .update({ status: "paid", payment_provider: "stripe", payment_id: session.payment_intent || session.id, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("status", "pending");
    if (error) return json({ error: "Could not mark order paid" }, 500);
  } else if (type === "checkout.session.expired") {
    const { data, error } = await supabase.rpc("release_expired_commercial_order", { p_order_id: orderId });
    if (error) return json({ error: "Could not release expired checkout inventory" }, 500);
    if (data === false) return json({ received: true, released: false });
  }

  return json({ received: true });
});
