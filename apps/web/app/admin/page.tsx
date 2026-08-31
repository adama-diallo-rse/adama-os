import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { createClient } from "../../lib/supabase/server";
import { logout } from "../login/actions";

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase)
    return (
      <PageShell tools={false}>
        <PageIntro
          eyebrow="ESPACE PRIVÉ / ADMINISTRATION"
          title="Administration"
          description="La connexion au service de données n’est pas configurée pour cet environnement."
        />
      </PageShell>
    );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: metrics, error } = await supabase
    .from("system_metrics")
    .select("key, value_num, value_text, unit, updated_at")
    .order("key", { ascending: true });
  return (
    <PageShell tools={false}>
      <PageIntro
        eyebrow="ESPACE PRIVÉ / ADMINISTRATION"
        title={
          <>
            Le suivi de <span className="serif">l’atelier.</span>
          </>
        }
        description={"Connecté : " + (user?.email ?? "")}
        aside={
          <form action={logout}>
            <button type="submit" className="header-contact">
              Déconnexion ↗
            </button>
          </form>
        }
      />
      <div className="private-content">
        <Link href="/checkin" className="portfolio-button primary">
          Mettre à jour les relevés →
        </Link>
        <section className="metrics-history">
          <h2>Relevés actuels</h2>
          {error ? (
            <p role="alert" className="form-error">
              Les relevés n’ont pas pu être chargés.
            </p>
          ) : (
            <div className="data-table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Indicateur</th>
                    <th scope="col">Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.map((m) => (
                    <tr key={m.key}>
                      <th scope="row">{m.key}</th>
                      <td>
                        {m.value_text ?? m.value_num}
                        {m.unit ? " " + m.unit : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
