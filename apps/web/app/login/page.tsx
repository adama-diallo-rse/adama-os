import type { Metadata } from "next";
import { PageShell } from "../../components/page-shell";
import { login } from "./actions";
export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  return (
    <PageShell tools={false}>
      <div className="auth-layout">
        <div className="auth-copy">
          <p className="portfolio-label">ADAMA OS / ESPACE PRIVÉ</p>
          <h1>
            Retour à<br />
            <span className="serif">l’atelier.</span>
          </h1>
          <p>
            Cet espace est réservé à l’administration du portfolio et à la mise
            à jour des relevés.
          </p>
        </div>
        <form action={login} className="auth-form">
          <input
            type="hidden"
            name="redirect"
            value={params.redirect ?? "/admin"}
          />
          <label htmlFor="login-email">Adresse e-mail</label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          <label htmlFor="login-password">Mot de passe</label>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
          {params.error && (
            <p className="form-error" role="alert">
              {params.error}
            </p>
          )}
          <button type="submit" className="portfolio-button primary">
            Se connecter <span aria-hidden="true">→</span>
          </button>
        </form>
      </div>
    </PageShell>
  );
}
