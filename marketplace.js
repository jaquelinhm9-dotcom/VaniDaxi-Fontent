import { supabase } from "./supabaseClient";

export function isSupabaseAvailable() {
  return Boolean(supabase);
}

function normalizeProduct(product) {
  if (!product) return null;

  return {
    ...product,
    price:
      typeof product.price === "number"
        ? product.price
        : Number(product.price || 0),
  };
}

export async function getProducts() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }

  return (data || []).map(normalizeProduct);
}

export async function getProfile(userId) {
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error al obtener perfil:", error);
    return null;
  }

  return data;
}

export async function upsertProfile(profile) {
  if (!supabase || !profile?.id) return null;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("Error al guardar perfil:", error);
    return null;
  }

  return data;
}

export async function getFavorites(userId) {
  if (!supabase || !userId) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }

  return (data || []).map((item) => item.product_id);
}

export async function setFavorite(userId, productId, isFavorite) {
  if (!supabase || !userId || !productId) return false;

  if (isFavorite) {
    const { error } = await supabase.from("favorites").upsert(
      {
        user_id: userId,
        product_id: productId,
      },
      {
        onConflict: "user_id,product_id",
      }
    );

    if (error) {
      console.error("Error al guardar favorito:", error);
      return false;
    }

    return true;
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    console.error("Error al eliminar favorito:", error);
    return false;
  }

  return true;
}

export async function createProduct(product) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error("Error al crear producto:", error);
    return null;
  }

  return normalizeProduct(data);
}

export async function createOrder(order) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();

  if (error) {
    console.error("Error al crear pedido:", error);
    return null;
  }

  return data;
}
