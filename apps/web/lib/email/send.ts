import "server-only";

// L6-T11 — Fonctions d'envoi de haut niveau. Assemblent template + Resend.
// Toutes fail-safe (renvoient false sans clé Resend) et ne lèvent jamais.

import { CONTACT_EMAIL } from "../../components/types";
import { siteUrl } from "../polar/config";
import { sendEmail } from "./resend";
import {
  courseDeliveryEmail,
  leadAlertEmail,
  rdvConfirmationEmail,
} from "./templates";

/** Alerte interne : un nouveau lead est arrivé (envoyée à l'adresse contact). */
export async function notifyLead(input: {
  source: string;
  email: string;
  company?: string | null;
  details?: string | null;
}): Promise<boolean> {
  const { subject, html } = leadAlertEmail(input);
  return sendEmail({ to: CONTACT_EMAIL, subject, html, replyTo: input.email });
}

/** Livraison d'accès formation après un achat (envoyée à l'acheteur). */
export async function deliverCourse(input: {
  email: string;
  courseTitle: string;
}): Promise<boolean> {
  const accessUrl = `${siteUrl()}/learn/acces`;
  const { subject, html } = courseDeliveryEmail({
    courseTitle: input.courseTitle,
    accessUrl,
  });
  return sendEmail({ to: input.email, subject, html });
}

/** Confirmation de rendez-vous (envoyée au contact). */
export async function confirmRdv(input: {
  to: string;
  name?: string | null;
  when?: string | null;
  joinUrl?: string | null;
}): Promise<boolean> {
  const { subject, html } = rdvConfirmationEmail(input);
  return sendEmail({ to: input.to, subject, html });
}
