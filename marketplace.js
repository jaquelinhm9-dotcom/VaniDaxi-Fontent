import { supabase } from "../supabaseClient";

export const TABLES = {
  products: "products",
  favorites: "favorites",
  profiles: "profiles",
  orders: "orders",
  orderItems: "order_items",
};

export function isSupabaseAvailable() {
  return Boolean(supabase?.from);
}

export function mapProduct(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name || "Producto",
    price: Number(row.price) || 0,
    oldPrice: row.old_price == null ? null : Number(row.old_price),
    rating: Number(row.rating) || 0,
    reviews: Number(row.reviews) || 0,
    discount: Number(row.discount) || 0,
    category: row.category || "Otros",
    type: row.type || "Nuevo",
    image: row.image || "",
    description: row.description || "",
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    sellerId: row.seller_id || null,
    stock: row.stock == null ? 0 : Number(row.stock),
    createdAt: row.created_at || null,
  };
}

export async function getProducts() {
  if (!isSupabaseAvailable()) return { data: null, error: null, unavailable: true };
  const { data, error } = await supabase
    .from(TABLES.products)
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error, unavailable: false };
  return { data: (data || []).map(mapProduct), error: null, unavailable: false };
}

export async function createProduct(product, userId) {
  if (!isSupabaseAvailable()) return { data: null, error: null, unavailable: true };
  const { data, error } = await supabase
    .from(TABLES.products)
    .insert({
      seller_id: userId,
      name: product.name,
      price: Number(product.price),
      old_price: product.oldPrice ?? null,
      category: product.category,
      type: product.type || "Nuevo",
      image: product.image || null,
      description: product.description || "",
      specifications: product.specifications || [],
      stock: Number(product.stock ?? 1),
      is_active: true,
    })
    .select()
    .single();

  if (error) return { data: null, error, unavailable: false };
  return { data: mapProduct(data), error: null, unavailable: false };
}

export async function getProfile(userId) {
  if (!isSupabaseAvailable() || !userId) return { data: null, error: null, unavailable: true };
  const { data, error } = await supabase.from(TABLES.profiles).select("*").eq("id", userId).maybeSingle();
  return { data, error, unavailable: false };
}

export async function upsertProfile(userId, values) {
  if (!isSupabaseAvailable() || !userId) return { data: null, error: null, unavailable: true };
  const { data, error } = await supabase
    .from(TABLES.profiles)
    .upsert({ id: userId, ...values, updated_at: new Date().toISOString() })
    .select()
    .single();
  return { data, error, unavailable: false };
}

export async function getFavorites(userId) {
  if (!isSupabaseAvailable() || !userId) return { data: null, error: null, unavailable: true };
  const { data, error } = await supabase.from(TABLES.favorites).select("product_id").eq("user_id", userId);
  return { data: (data || []).map((row) => String(row.product_id)), error, unavailable: false };
}

export async function setFavorite(userId, productId, active) {
  if (!isSupabaseAvailable() || !userId) return { error: null, unavailable: true };
  if (active) {
    const { error } = await supabase.from(TABLES.favorites).upsert({ user_id: userId, product_id: productId });
    return { error, unavailable: false };
  }
  const { error } = await supabase.from(TABLES.favorites).delete().eq("user_id", userId).eq("product_id", productId);
  return { error, unavailable: false };
}

export async function createOrder({ userId, customer, cart, total, paymentMethod = "contra_entrega" }) {
  if (!isSupabaseAvailable() || !userId) return { data: null, error: null, unavailable: true };

  const { data: order, error: orderError } = await supabase
    .from(TABLES.orders)
    .insert({
      user_id: userId,
      customer_name: customer.name,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      reference: customer.reference || null,
      total: Number(total),
      status: "pending",
      payment_method: paymentMethod,
    })
    .select()
    .single();

  if (orderError) return { data: null, error: orderError, unavailable: false };

  const items = cart.map((item) => ({
    order_id: order.id,
    product_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(item.id)) ? item.id : null,
    product_name: item.name,
    unit_price: Number(item.price),
    quantity: Number(item.quantity),
    subtotal: Number(item.price) * Number(item.quantity),
    seller_id: item.sellerId || null,
  }));

  const { error: itemsError } = await supabase.from(TABLES.orderItems).insert(items);
  if (itemsError) return { data: order, error: itemsError, unavailable: false };

  return { data: order, error: null, unavailable: false };
}
