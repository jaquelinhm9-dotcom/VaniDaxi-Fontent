import { supabase } from "./supabaseClient";

export const isSupabaseAvailable = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const unavailableError = new Error(
  "Supabase no está configurado correctamente."
);

function unavailableResult() {
  return {
    data: null,
    error: unavailableError,
    unavailable: true,
  };
}

export async function getProducts() {
  if (!isSupabaseAvailable) {
    return unavailableResult();
  }

  return supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getProfile(userId) {
  if (!isSupabaseAvailable || !userId) {
    return unavailableResult();
  }

  return supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
}

export async function upsertProfile(userId, profile) {
  if (!isSupabaseAvailable || !userId) {
    return unavailableResult();
  }

  return supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        ...profile,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    )
    .select()
    .single();
}

export async function getFavorites(userId) {
  if (!isSupabaseAvailable || !userId) {
    return unavailableResult();
  }

  return supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", userId);
}

export async function setFavorite(userId, productId, active) {
  if (!isSupabaseAvailable || !userId || !productId) {
    return unavailableResult();
  }

  if (active) {
    return supabase
      .from("favorites")
      .upsert(
        {
          user_id: userId,
          product_id: productId,
        },
        {
          onConflict: "user_id,product_id",
        }
      );
  }

  return supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
}

export async function createProduct(payload, userId) {
  if (!isSupabaseAvailable || !userId) {
    return unavailableResult();
  }

  return supabase
    .from("products")
    .insert({
      ...payload,
      seller_id: userId,
    })
    .select()
    .single();
}

export async function createOrder({
  userId,
  customer,
  cart,
  total,
  paymentMethod,
}) {
  if (!isSupabaseAvailable || !userId) {
    return unavailableResult();
  }

  const items = Array.isArray(cart)
    ? cart.map((item) => ({
        product_id: item.id,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
      }))
    : [];

  const orderResult = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      total: Number(total || 0),
      payment_method: paymentMethod || null,
      customer_name: customer?.name || null,
      customer_phone: customer?.phone || null,
      customer_address: customer?.address || null,
      status: "pending",
    })
    .select()
    .single();

  if (orderResult.error) {
    return orderResult;
  }

  if (items.length === 0) {
    return {
      data: orderResult.data,
      error: null,
    };
  }

  const itemsResult = await supabase
    .from("order_items")
    .insert(
      items.map((item) => ({
        order_id: orderResult.data.id,
        ...item,
      }))
    );

  if (itemsResult.error) {
    return {
      data: orderResult.data,
      error: itemsResult.error,
    };
  }

  return {
    data: orderResult.data,
    error: null,
  };
}
