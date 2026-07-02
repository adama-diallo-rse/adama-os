import type { CSSProperties } from "react";
import { createClient } from "../../lib/supabase/server";
import { logout } from "../login/actions";
import { updateMetric } from "./actions";

// L1-T8, page privée de check-in (protégée par le middleware + revérif session).
// Permet de mettre à jour les métriques du dashboard en 1 clic.
export const dynamic = "force-dynamic";

// Boutons rapides : chaque valeur candidate est un bouton (formulaire 1 clic).
const QUICK: { key: string; label: string; values: string[] }[] = [
  {
    key: "system_status",
    label: "System status",
    values: ["ONLINE - BUILDING MODE", "ONLINE - SHIPPING", "OFFLINE - REST"],
  },
  { key: "deep_work_status", label: "Deep work", values: ["Active", "Paused"] },
  {
    key: "social_media_status",
    label: "Social media",
    values: ["Locked", "Unlocked"],
  },
  {
    key: "energy_level",
    label: "Energy",
    values: ["Optimal", "Correct", "Bas"],
  },
];

type Metric = {
  key: string;
  value_num: number | null;
  value_text: string | null;
  unit: string | null;
  updated_at: string;
};

export default async function CheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  if (!supabase) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#f87171" }}>
          Configuration Supabase indisponible (clés manquantes dans
          .env.local).
        </p>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("system_metrics")
    .select("key, value_num, value_text, unit, updated_at")
    .order("key", { ascending: true });

  const metrics = (data as Metric[]) ?? [];
  const current = new Map(metrics.map((m) => [m.key, m]));

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Adama OS, Check-in</h1>
          <p style={{ margin: 0, color: "#a1a1aa", fontSize: "0.8rem" }}>
            Connecté : {user?.email}
          </p>
        </div>
        <form action={logout}>
          <button type="submit" style={btnGhost}>
            Déconnexion
          </button>
        </form>
      </div>

      {params.ok ? (
        <p style={{ color: "#10b981", fontSize: "0.85rem" }}>
          Métrique mise à jour.
        </p>
      ) : null}
      {params.error ? (
        <p style={{ color: "#f87171", fontSize: "0.85rem" }}>{params.error}</p>
      ) : null}
      {error ? (
        <p style={{ color: "#f87171", fontSize: "0.85rem" }}>
          Lecture impossible : {error.message}
        </p>
      ) : null}

      {/* Boutons rapides, 1 clic */}
      <h2 style={sectionTitle}>Mise à jour rapide</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {QUICK.map((group) => {
          const active = current.get(group.key)?.value_text ?? null;
          return (
            <div key={group.key}>
              <p style={labelStyle}>
                {group.label}{" "}
                <span style={{ color: "#52525b" }}>
                  ({active ?? "non défini"})
                </span>
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {group.values.map((v) => {
                  const isActive = active === v;
                  return (
                    <form key={v} action={updateMetric}>
                      <input type="hidden" name="key" value={group.key} />
                      <input type="hidden" name="value_text" value={v} />
                      <button
                        type="submit"
                        style={isActive ? chipActive : chip}
                      >
                        {v}
                      </button>
                    </form>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progression lean bulk (numérique, 1 champ) */}
      <h2 style={sectionTitle}>Progression lean bulk</h2>
      <form action={updateMetric} style={rowForm}>
        <input type="hidden" name="key" value="lean_bulk_progress" />
        <input
          name="value_num"
          type="number"
          min="0"
          max="100"
          step="1"
          defaultValue={current.get("lean_bulk_progress")?.value_num ?? ""}
          placeholder="%"
          style={inputStyle}
        />
        <input type="hidden" name="unit" value="%" />
        <button type="submit" style={btnPrimary}>
          Enregistrer
        </button>
      </form>

      {/* Édition libre de n'importe quelle clé */}
      <h2 style={sectionTitle}>Édition libre</h2>
      <form action={updateMetric} style={{ display: "grid", gap: "0.5rem" }}>
        <input
          name="key"
          placeholder="clé (ex: current_focus)"
          required
          style={inputStyle}
        />
        <input name="value_text" placeholder="valeur texte" style={inputStyle} />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            name="value_num"
            type="number"
            step="any"
            placeholder="valeur num (optionnel)"
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            name="unit"
            placeholder="unité"
            style={{ ...inputStyle, width: "90px" }}
          />
        </div>
        <button type="submit" style={btnPrimary}>
          Mettre à jour
        </button>
      </form>

      {/* État courant */}
      <h2 style={sectionTitle}>État courant</h2>
      <ul style={{ lineHeight: 1.8, fontSize: "0.85rem" }}>
        {metrics.map((m) => (
          <li key={m.key}>
            <span style={{ color: "#a1a1aa" }}>{m.key}</span> ={" "}
            {m.value_text ?? m.value_num}
            {m.unit ? ` ${m.unit}` : ""}
          </li>
        ))}
      </ul>
    </main>
  );
}

// --- Styles (cohérents avec /admin et /login) ------------------------
const pageStyle: CSSProperties = {
  minHeight: "100dvh",
  padding: "2rem",
  maxWidth: "720px",
  margin: "0 auto",
  background: "#0a0a0a",
  color: "#fafafa",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};
const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
};
const sectionTitle: CSSProperties = {
  fontSize: "0.9rem",
  color: "#10b981",
  marginTop: "1.75rem",
  marginBottom: "0.6rem",
};
const labelStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "#a1a1aa",
  margin: "0 0 0.35rem",
};
const inputStyle: CSSProperties = {
  padding: "0.55rem",
  borderRadius: "8px",
  border: "1px solid #27272a",
  background: "#0a0a0a",
  color: "#fafafa",
  fontFamily: "inherit",
};
const rowForm: CSSProperties = { display: "flex", gap: "0.5rem" };
const chip: CSSProperties = {
  padding: "0.4rem 0.7rem",
  borderRadius: "999px",
  border: "1px solid #27272a",
  background: "#111111",
  color: "#e4e4e7",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.8rem",
};
const chipActive: CSSProperties = {
  ...chip,
  border: "1px solid #10b981",
  background: "#0c2a1e",
  color: "#6ee7b7",
};
const btnPrimary: CSSProperties = {
  padding: "0.55rem 0.9rem",
  borderRadius: "8px",
  border: "1px solid #10b981",
  background: "#10b981",
  color: "#04110b",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};
const btnGhost: CSSProperties = {
  padding: "0.5rem 0.9rem",
  borderRadius: "8px",
  border: "1px solid #27272a",
  background: "#111111",
  color: "#fafafa",
  cursor: "pointer",
  fontFamily: "inherit",
};
