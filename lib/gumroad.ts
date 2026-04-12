// Gumroad API helper. Used to verify that a sale actually happened
// before we create a workspace / grant access.
//
// Docs: https://app.gumroad.com/api
//
// Gumroad exposes a "verify license" endpoint that we can call with
// just the license key + product_id. The license key is what Gumroad
// appends to the redirect URL after a successful purchase.

const GUMROAD_API = "https://api.gumroad.com/v2";

export interface GumroadSale {
  paid: boolean;
  email: string | null;
  name: string | null;
  saleId: string | null;
  productPermalink: string | null;
  productId: string | null;
}

/**
 * Verify a Gumroad sale by its ID using the authenticated API.
 * Requires GUMROAD_ACCESS_TOKEN env var.
 */
export async function verifyGumroadSale(saleId: string): Promise<GumroadSale> {
  const token = process.env.GUMROAD_ACCESS_TOKEN;
  if (!token) {
    throw new Error("GUMROAD_ACCESS_TOKEN env var missing");
  }

  try {
    const res = await fetch(`${GUMROAD_API}/sales/${saleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return {
        paid: false,
        email: null,
        name: null,
        saleId,
        productPermalink: null,
        productId: null,
      };
    }

    const data = await res.json();
    const sale = data?.sale ?? null;

    if (!sale) {
      return {
        paid: false,
        email: null,
        name: null,
        saleId,
        productPermalink: null,
        productId: null,
      };
    }

    return {
      paid: !sale.refunded && !sale.disputed && !sale.chargebacked,
      email: sale.email ?? null,
      name: sale.full_name ?? sale.purchaser_name ?? null,
      saleId: sale.id ?? saleId,
      productPermalink: sale.product_permalink ?? null,
      productId: sale.product_id ?? null,
    };
  } catch (err) {
    console.error("Gumroad verify error:", err);
    return {
      paid: false,
      email: null,
      name: null,
      saleId,
      productPermalink: null,
      productId: null,
    };
  }
}
