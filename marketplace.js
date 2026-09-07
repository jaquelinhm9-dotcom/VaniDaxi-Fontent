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

/* =========================================================
   UTILIDADES
   ========================================================= */

export function isUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

function normalizeProduct(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name || "Producto sin nombre",
    price: Number(row.price || 0),
    oldPrice:
      row.oldPrice != null
        ? Number(row.oldPrice)
        : null,
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    discount: Number(row.discount || 0),
    category: row.category || "General",
    type: row.type || "Nuevo",
    image: row.image_url || row.image || "",
    description: row.description || "",
    specifications: Array.isArray(row.specifications)
      ? row.specifications
      : [],
    stock: Number(row.stock ?? 0),
    location: row.location || "",
    sellerId: row.seller_id || row.sellerId || null,
    active: row.active !== false,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

/* =========================================================
   PRODUCTOS
   ========================================================= */

export async function getProducts() {
  if (!isSupabaseAvailable) {
    return unavailableResult();
  }

  const result = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (result.error) {
    return result;
  }

  return {
    data: Array.isArray(result.data)
      ? result.data.map(normalizeProduct).filter(Boolean)
      : [],
    error: null,
  };
}

/* =========================================================
   PERFIL
   ========================================================= */

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

/* =========================================================
   FAVORITOS
   ========================================================= */

export async function getFavorites(userId) {
  if (!isSupabaseAvailable || !userId) {
    return unavailableResult();
  }

  const result = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", userId);

  if (result.error) {
    return result;
  }

  return {
    data: Array.isArray(result.data)
      ? result.data
          .map((item) => item.product_id)
          .filter(Boolean)
      : [],
    error: null,
  };
}

export async function setFavorite(userId, productId, active) {
  if (
    !isSupabaseAvailable ||
    !userId ||
    !productId ||
    !isUuid(productId)
  ) {
    return {
      data: null,
      error: null,
      skipped: true,
    };
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

/* =========================================================
   CREAR PRODUCTO
   ========================================================= */

export async function createProduct(payload, userId) {
  if (!isSupabaseAvailable || !userId) {
    return unavailableResult();
  }

  const productPayload = {
    name: payload?.name || "Producto sin nombre",
    description: payload?.description || null,
    price: Number(payload?.price || 0),
    image_url: payload?.image_url || payload?.image || null,
    category: payload?.category || null,
    stock: Math.max(0, Number(payload?.stock ?? 1)),
    location: payload?.location || null,
    active: payload?.active !== false,
    seller_id: userId,
  };

  const result = await supabase
    .from("products")
    .insert(productPayload)
    .select("*")
    .single();

  if (result.error) {
    return result;
  }

  return {
    data: normalizeProduct(result.data),
    error: null,
  };
}

/* =========================================================
   PEDIDOS
   ========================================================= */

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

  const validCart = Array.isArray(cart)
    ? cart
        .filter(
          (item) =>
            item &&
            isUuid(item.id) &&
            Number(item.quantity || 0) > 0
        )
        .map((item) => ({
          id: item.id,
          quantity: Math.max(1, Math.floor(Number(item.quantity || 1))),
        }))
    : [];

  if (validCart.length === 0) {
    return {
      data: null,
      error: new Error("No hay productos válidos para crear el pedido."),
    };
  }

  const productIds = [...new Set(validCart.map((item) => item.id))];
  const productsResult = await supabase
    .from("products")
    .select("id, price, stock, active")
    .in("id", productIds);

  if (productsResult.error) {
    return productsResult;
  }

  const productsById = new Map(
    (productsResult.data || []).map((product) => [product.id, product])
  );

  for (const item of validCart) {
    const product = productsById.get(item.id);

    if (!product || product.active !== true) {
      return {
        data: null,
        error: new Error("Uno de los productos del carrito ya no está disponible."),
      };
    }

    if (Number(product.stock) < item.quantity) {
      return {
        data: null,
        error: new Error("La cantidad solicitada supera el inventario disponible."),
      };
    }
  }

  // El total enviado por el navegador no se considera confiable.
  // El importe del pedido se recalcula con los precios actuales de Supabase.
  const calculatedTotal = validCart.reduce((sum, item) => {
    const product = productsById.get(item.id);
    return sum + Number(product?.price || 0) * item.quantity;
  }, 0);

  const orderResult = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      total: calculatedTotal,
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

  const items = validCart.map((item) => ({
    order_id: orderResult.data.id,
    product_id: item.id,
    quantity: item.quantity,
    price: Number(productsById.get(item.id)?.price || 0),
  }));

  const itemsResult = await supabase
    .from("order_items")
    .insert(items);

  if (itemsResult.error) {
    return {
      data: orderResult.data,
      error: itemsResult.error,
    };
  }

  return {
    data: orderResult.data,
    error: null,
    total: calculatedTotal,
  };
}
