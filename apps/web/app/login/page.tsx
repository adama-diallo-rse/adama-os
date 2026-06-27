import type { CSSProperties } from "react";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      <form
        action={login}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          width: "min(360px, 90vw)",
          padding: "2rem",
          border: "1px solid #27272a",
          borderRadius: "12px",
          background: "#111111",
        }}
      >
        <h1 style={{ fontSize: "1.1rem", margin: 0 }}>Adama OS, Admin</h1>
        <p style={{ fontSize: "0.8rem", color: "#a1a1aa", margin: 0 }}>
          Accès réservé. Connecte-toi avec ton compte admin Supabase.
        </p>

        <input type="hidden" name="redirect" value={params.redirect ?? "/admin"} />

        <input
          name="email"
          type="email"
          placeholder="email"
          required
          autoComplete="email"
          style={inputStyle}
        />
        <input
          name="password"
          type="password"
          placeholder="mot de passe"
          required
          autoComplete="current-password"
          style={inputStyle}
        />

        {params.error ? (
          <p style={{ color: "#f87171", fontSize: "0.8rem", margin: 0 }}>
            {params.error}
          </p>
        ) : null}

        <button
          type="submit"
          style={{
            marginTop: "0.5rem",
            padding: "0.6rem",
            borderRadius: "8px",
            border: "1px solid #10b981",
            background: "#10b981",
            color: "#04110b",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Se connecter
        </button>
      </form>
    </main>
  );
}

const inputStyle: CSSProperties = {
  padding: "0.6rem",
  borderRadius: "8px",
  border: "1px solid #27272a",
  background: "#0a0a0a",
  color: "#fafafa",
  fontFamily: "inherit",
};
