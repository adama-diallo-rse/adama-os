// L8-T6 — Better Stack Uptime : le badge "Online" reflète un vrai statut.
// Fetch serveur, cache 60 s, jamais bloquant : sans token / monitor ou en
// cas d'erreur on renvoie null et le dashboard retombe sur system_metrics.

export type UptimeStatus = "up" | "down";

type MonitorResponse = {
  data?: {
    attributes?: {
      status?: string;
    };
  };
};

export async function fetchUptimeStatus(): Promise<UptimeStatus | null> {
  const token = process.env.BETTERSTACK_API_TOKEN?.trim();
  const monitorId = process.env.BETTERSTACK_MONITOR_ID?.trim();

  if (!token || !monitorId) {
    return null;
  }

  try {
    const res = await fetch(
      `https://uptime.betterstack.com/api/v2/monitors/${monitorId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as MonitorResponse;
    const status = json.data?.attributes?.status;

    // Statuts Better Stack : up, down, paused, pending, maintenance, validating.
    if (status === "up" || status === "validating") {
      return "up";
    }
    if (status === "down") {
      return "down";
    }
    return null;
  } catch {
    return null;
  }
}
