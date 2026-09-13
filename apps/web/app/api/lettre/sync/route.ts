// EH0, l'entretien quotidien de la lettre. GET /api/lettre/sync
//
//   - applique la retention annoncee dans la mention : une demande jamais
//     confirmee disparait 30 jours apres, une preuve de retrait 3 ans apres ;
//   - rejoue les messages de bienvenue qu'un incident d'envoi a laisses en
//     attente, dans la limite du plafond du jour ;
//   - garde le projet dedie actif : un projet gratuit sans requete pendant
//     une semaine est mis en pause, et une lettre en pause ne collecte plus.
//
// Appelee par Vercel Cron (apps/web/vercel.json, 05:30 UTC), qui envoie
// "Authorization: Bearer $CRON_SECRET". Manuellement :
//   curl -H "Authorization: Bearer <CRON_SECRET>" https://adamesg-os.fr/api/lettre/sync
//
// Meme regle que /api/ecosystem/sync : sans CRON_SECRET, ouverte en
// developpement et fermee en production. Le nom finit par /sync pour que
// l'inventaire la range parmi les routes protegees.
import { NextResponse } from "next/server";
import { lireConfigLettre } from "../../../../lib/lettre/config";
import { entretenir } from "../../../../lib/lettre/parcours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function autorise(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!autorise(req)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const lecture = lireConfigLettre();
  if (!lecture.ok) {
    return NextResponse.json(
      {
        error: "La lettre n’est pas configurée sur cet environnement.",
        manquants: lecture.manquants,
        refus: lecture.refus,
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  try {
    const bilan = await entretenir(lecture.config);
    return NextResponse.json(
      { ok: true, ...bilan },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (erreur) {
    return NextResponse.json(
      {
        error:
          erreur instanceof Error
            ? erreur.message
            : "L’entretien de la lettre a échoué.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
