import "server-only";

// L6-T6 — Création d'une session de paiement Polar via l'API REST.
// On passe par un simple fetch (aucune dépendance SDK) : cela garantit que le
// build ne dépend d'aucun paquet externe et reste type-safe. La fonction ne
// lève jamais : en cas d'échec (Polar non configuré, réseau, réponse non-2xx),
// elle renvoie null et l'appelant gère le repli.

import { polarApiBase, polarToken } from "./config";

type CreateCheckoutInput = {
  productId: string;
  successUrl: string;
  customerEmail?: string | null;
  metadata?: Record<string, string>;
};

type CheckoutResult = { url: string; id: string };

export async function createCheckout(
  input: CreateCheckoutInput,
): Promise<CheckoutResult | null> {
  const token = polarToken();
  if (!token) return null;

  const body: Record<string, unknown> = {
    // API Polar actuelle : liste d'IDs produits.
    products: [input.productId],
    success_url: input.successUrl,
  };
  if (input.customerEmail) body.customer_email = input.customerEmail;
  if (input.metadata) body.metadata = input.metadata;

  try {
    const res = await fetch(`${polarApiBase()}/v1/checkouts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // Jamais mis en cache : c'est une écriture.
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { url?: unknown; id?: unknown };
    const url = typeof data.url === "string" ? data.url : null;
    const id = typeof data.id === "string" ? data.id : "";
    if (!url) return null;
    return { url, id };
  } catch {
    return null;
  }
}
