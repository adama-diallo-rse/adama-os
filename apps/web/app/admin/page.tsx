import { createClient } from "../../lib/supabase/server";
import { logout } from "../login/actions";

// Page admin protégée (le middleware redirige déjà les non-connectés).
// Lit system_metrics via la session authentifiée : prouve que l'auth et
// la RLS fonctionnent de bout en bout.
export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: metrics, error } = await supabase
    .from("system_metrics")
    .select("key, value_num, value_text, unit, updated_at")
    .order("key", { ascending: true });

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "2rem",
        background: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.2rem" }}>Adama OS, Admin</h1>
          <p style={{ margin: 0, color: "#a1a1aa", fontSize: "0.8rem" }}>
            Connecté : {user?.email}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            style={{
              padding: "0.5rem 0.9rem",
              borderRadius: "8px",
              border: "1px solid #27272a",
              background: "#111111",
              color: "#fafafa",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Déconnexion
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: "0.9rem", color: "#10b981" }}>
        system_metrics (lecture authentifiée)
      </h2>

      {error ? (
        <p style={{ color: "#f87171" }}>Erreur de lecture : {error.message}</p>
      ) : (
        <ul style={{ lineHeight: 1.8, fontSize: "0.85rem" }}>
          {metrics?.map((m) => (
            <li key={m.key}>
              <span style={{ color: "#a1a1aa" }}>{m.key}</span> ={" "}
              {m.value_text ?? m.value_num}
              {m.unit ? ` ${m.unit}` : ""}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
