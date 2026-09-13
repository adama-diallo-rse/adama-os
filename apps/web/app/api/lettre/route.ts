// EH0, la route publique des liens de la lettre. GET et POST /api/lettre
//
// Trois usages, et aucun ne renvoie de donnee :
//
//   GET  ?confirmation=<jeton>
//        Le lien du message de confirmation. La route NE CONFIRME PAS : un
//        analyseur de liens de messagerie ouvre les liens avant la personne,
//        et une confirmation a l'ouverture confirmerait a sa place. Elle
//        verifie le jeton en lecture seule, le pose dans un cookie limite a
//        /lettre, puis redirige vers la page, ou un bouton confirme
//        (XDEC-39). Le jeton ne passe jamais par l'URL de la page, donc ni
//        par la mesure d'audience ni par un en-tete Referer.
//
//   GET  ?desinscription=<jeton>
//        Le lien place en bas de chaque message. La desinscription est
//        faite au premier clic, sans question ni compte, puis la page le dit.
//
//   POST ?desinscription=<jeton>
//        La desinscription en un clic declenchee par la messagerie depuis
//        l'en-tete List-Unsubscribe-Post (RFC 8058). Reponse en texte simple.
//
// Sans configuration de la lettre, les liens redirigent vers /lettre avec
// l'etat « indisponible », et le POST repond 503 avec la raison en clair.
import { NextResponse } from "next/server";
import { lireConfigLettre } from "../../../lib/lettre/config";
import {
  COOKIE_CONFIRMATION,
  desinscrireParJeton,
  verifierLien,
} from "../../../lib/lettre/parcours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENTETES = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex",
} as const;

/** Duree de vie du cookie de confirmation, en secondes. */
const VIE_COOKIE_S = 30 * 60;

function vers(req: Request, chemin: string): NextResponse {
  const reponse = NextResponse.redirect(new URL(chemin, req.url), 303);
  for (const [cle, valeur] of Object.entries(ENTETES)) {
    reponse.headers.set(cle, valeur);
  }
  return reponse;
}

export async function GET(req: Request): Promise<Response> {
  const params = new URL(req.url).searchParams;
  const confirmation = params.get("confirmation");
  const desinscription = params.get("desinscription");
  const lecture = lireConfigLettre();

  if (!confirmation && !desinscription) {
    return vers(req, "/lettre");
  }
  if (!lecture.ok) {
    return vers(req, "/lettre?etat=indisponible");
  }

  try {
    if (confirmation) {
      const etat = await verifierLien(lecture.config, confirmation);
      if (etat === "expire") return vers(req, "/lettre?etat=lien-expire");
      if (etat !== "valide") return vers(req, "/lettre?etat=lien-invalide");
      const reponse = vers(req, "/lettre?etape=confirmer");
      reponse.cookies.set({
        name: COOKIE_CONFIRMATION,
        value: confirmation,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/lettre",
        maxAge: VIE_COOKIE_S,
      });
      return reponse;
    }

    const issue = await desinscrireParJeton(
      lecture.config,
      desinscription as string,
      "lien",
    );
    if (issue === "invalide") return vers(req, "/lettre?etat=lien-invalide");
    return vers(
      req,
      issue === "desinscrit"
        ? "/lettre?etat=desinscrit"
        : "/lettre?etat=deja-desinscrit",
    );
  } catch {
    return vers(req, "/lettre?etat=indisponible");
  }
}

export async function POST(req: Request): Promise<Response> {
  const jeton = new URL(req.url).searchParams.get("desinscription");
  const lecture = lireConfigLettre();
  if (!lecture.ok) {
    return NextResponse.json(
      { error: "La lettre n’est pas configurée sur cet environnement." },
      { status: 503, headers: ENTETES },
    );
  }
  if (!jeton) {
    return new NextResponse("Lien de désinscription absent.", {
      status: 400,
      headers: { ...ENTETES, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  try {
    const issue = await desinscrireParJeton(
      lecture.config,
      jeton,
      "en_tete_un_clic",
    );
    if (issue === "invalide") {
      return new NextResponse("Lien de désinscription invalide.", {
        status: 400,
        headers: { ...ENTETES, "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return new NextResponse("Désinscription enregistrée.", {
      status: 200,
      headers: { ...ENTETES, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return NextResponse.json(
      { error: "La désinscription n’a pas pu être enregistrée. Réessayez." },
      { status: 503, headers: ENTETES },
    );
  }
}
