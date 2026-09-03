"use server";

// =====================================================================
// C6-T8, la relecture des ADR.
//
// Ecriture par la session authentifiee : la politique decisions_admin_write
// de la migration 0000, reservee au role authenticated, autorise la mise a
// jour. Un visiteur anonyme ne peut pas basculer un ADR en relu, meme en
// appelant cette action directement.
//
// Double garde-fou : la route est deja protegee par le proxy, mais une
// server action est un point d'entree a part entiere, et on reverifie donc
// la session ici.
// =====================================================================

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

const FORMAT_ADR = /^DEC-[0-9]{3}$/;

export async function marquerRelu(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) {
    redirect("/admin/relecture?error=Supabase%20non%20configure");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/admin/relecture");
  }

  const adrId = String(formData.get("adr_id") ?? "").trim();
  if (!FORMAT_ADR.test(adrId)) {
    redirect("/admin/relecture?error=Identifiant%20invalide");
  }

  // La valeur envoyee dit dans quel sens basculer. Une relecture se defait :
  // se relire mal est possible, et le chemin de retour doit exister.
  const vers = String(formData.get("vers") ?? "true") === "true";

  const { error } = await supabase
    .from("decisions_log")
    .update({ reviewed_by_adama: vers })
    .eq("adr_id", adrId);

  if (error) {
    redirect(`/admin/relecture?error=${encodeURIComponent(error.message)}`);
  }

  // La bascule change ce que la cle anonyme peut lire : toutes les pages qui
  // servent le journal sont a rafraichir, pas seulement celle-ci.
  revalidatePath("/admin/relecture");
  revalidatePath("/decisions");
  revalidatePath(`/decisions/${adrId}`);
  revalidatePath("/revirements");
  revalidatePath("/principes");
  redirect(`/admin/relecture?ok=${adrId}`);
}
