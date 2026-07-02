"use server";

// L1-T8, mise à jour d'une métrique en 1 clic.
// Écriture via la session authentifiée : la RLS (policy system_metrics_admin_write,
// réservée au rôle authenticated) autorise l'upsert. Un visiteur anonyme ne peut
// pas écrire, même en appelant l'action directement.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export async function updateMetric(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/checkin?error=Supabase%20non%20configure");
  }

  // Double garde-fou : la page est déjà protégée par le middleware, mais on
  // revérifie la session ici car une server action est un endpoint à part entière.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/checkin");
  }

  const key = String(formData.get("key") ?? "").trim();
  if (!key) {
    redirect("/checkin?error=Cle%20manquante");
  }

  const rawText = formData.get("value_text");
  const rawNum = formData.get("value_num");
  const rawUnit = formData.get("unit");

  const valueText =
    rawText !== null && String(rawText).trim() !== ""
      ? String(rawText).trim()
      : null;

  let valueNum: number | null = null;
  if (rawNum !== null && String(rawNum).trim() !== "") {
    const parsed = Number(String(rawNum).replace(",", "."));
    if (Number.isNaN(parsed)) {
      redirect("/checkin?error=Valeur%20numerique%20invalide");
    }
    valueNum = parsed;
  }

  const unit =
    rawUnit !== null && String(rawUnit).trim() !== ""
      ? String(rawUnit).trim()
      : null;

  const { error } = await supabase.from("system_metrics").upsert(
    {
      key,
      value_text: valueText,
      value_num: valueNum,
      unit,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) {
    redirect(`/checkin?error=${encodeURIComponent(error.message)}`);
  }

  // Rafraîchit la page de check-in et le dashboard public.
  revalidatePath("/checkin");
  revalidatePath("/");
  redirect("/checkin?ok=1");
}
