import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
const webhookSecret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");
}
async function verifySignature(req: Request, paymentId: string) {
  if (!webhookSecret) return false;
  const signature = req.headers.get("x-signature") || "";
  const requestId = req.headers.get("x-request-id") || "";
  const ts = signature.match(/(?:^|,)ts=([^,]+)/)?.[1] || "";
  const v1 = signature.match(/(?:^|,)v1=([^,]+)/)?.[1] || "";
  if (!ts || !v1 || !requestId || !paymentId) return false;
  const timestamp = Number(ts);
  if (!Number.isFinite(timestamp)) return false;
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - Math.floor(timestamp));
  if (ageSeconds > 300) return false;
  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(webhookSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  return hex(mac).toLowerCase() === v1.toLowerCase();
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: true });
  if (!accessToken || !webhookSecret) return json({ error: "Mercado Pago webhook is not configured" }, 503);
  const url = new URL(req.url);
  const body = await req.json().catch(() => null) as { type?: string; action?: string; data?: { id?: string | number }; id?: string | number; topic?: string } | null;
  const paymentId = String(body?.data?.id || body?.id || url.searchParams.get("id") || "").trim();
  const type = body?.type || body?.topic || "";
  if (!paymentId || !(type === "payment" || type === "payments" || String(body?.action || "").startsWith("payment."))) return json({ received: true });
  if (!(await verifySignature(req, paymentId))) return json({ error: "Invalid webhook signature" }, 401);

  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const payment = await paymentResponse.json().catch(() => null);
  if (!paymentResponse.ok || !payment?.id) return json({ error: "Could not retrieve Mercado Pago payment" }, 502);
  const orderId = String(payment.external_reference || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return json({ received: true });
  const { data: order, error: orderError } = await supabase.from("orders").select("id,total,status,payment_provider").eq("id", orderId).maybeSingle();
  if (orderError) return json({ error: orderError.message }, 500);
  if (!order) return json({ received: true });
  const paidAmount = Number(payment.transaction_amount || 0);
  const orderTotal = Number(order.total || 0);
  const status = String(payment.status || "");

  if (status === "approved") {
    if (Math.round(paidAmount * 100) !== Math.round(orderTotal * 100)) return json({ error: "Payment amount mismatch" }, 409);
    const { data, error } = await supabase.rpc("mark_commercial_order_paid", { p_order_id: orderId, p_payment_id: String(payment.id) });
    if (error) return json({ error: "Could not mark order paid" }, 500);
    return json({ received: true, status: data?.status || "paid" });
  }

  const update: Record<string, unknown> = { payment_provider: "mercadopago", payment_id: String(payment.id) };
  if (status === "cancelled" || status === "rejected") update.status = "cancelled";
  const { error: updateError } = await supabase.from("orders").update(update).eq("id", orderId);
  if (updateError) return json({ error: updateError.message }, 500);
  return json({ received: true });
});
