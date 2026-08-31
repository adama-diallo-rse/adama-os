import { describe, expect, it } from "vitest";
import {
  clientKey,
  createRateLimiter,
  readPositiveInt,
} from "../lib/rate-limit";

// L8-T12 : /api/chat appelle un modèle payant sans authentification. Ce test
// vérifie que le garde-fou compte, bloque, et laisse repasser après la
// fenêtre.
describe("garde-fou de débit", () => {
  it("autorise jusqu'à la limite puis bloque", () => {
    const limiteur = createRateLimiter({ limit: 3, windowMs: 60_000 });
    const t = 1_000_000;
    expect(limiteur.check("ip", t).allowed).toBe(true);
    expect(limiteur.check("ip", t).allowed).toBe(true);
    const troisieme = limiteur.check("ip", t);
    expect(troisieme.allowed).toBe(true);
    expect(troisieme.remaining).toBe(0);

    const quatrieme = limiteur.check("ip", t);
    expect(quatrieme.allowed).toBe(false);
    expect(quatrieme.retryAfterS).toBeGreaterThan(0);
  });

  it("laisse repasser une fois la fenêtre écoulée", () => {
    const limiteur = createRateLimiter({ limit: 1, windowMs: 1000 });
    const t = 5_000_000;
    expect(limiteur.check("ip", t).allowed).toBe(true);
    expect(limiteur.check("ip", t + 500).allowed).toBe(false);
    expect(limiteur.check("ip", t + 1500).allowed).toBe(true);
  });

  it("compte séparément deux appelants", () => {
    const limiteur = createRateLimiter({ limit: 1, windowMs: 60_000 });
    const t = 42;
    expect(limiteur.check("a", t).allowed).toBe(true);
    expect(limiteur.check("b", t).allowed).toBe(true);
    expect(limiteur.check("a", t).allowed).toBe(false);
  });
});

describe("identification de l'appelant", () => {
  it("prend la première adresse de x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" });
    expect(clientKey(headers)).toBe("1.2.3.4");
  });

  it("retombe sur x-real-ip puis sur une clé commune", () => {
    expect(clientKey(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(clientKey(new Headers())).toBe("inconnu");
  });
});

describe("lecture des réglages", () => {
  it("ignore une valeur absente, vide ou absurde", () => {
    expect(readPositiveInt(undefined, 12)).toBe(12);
    expect(readPositiveInt("", 12)).toBe(12);
    expect(readPositiveInt("zero", 12)).toBe(12);
    expect(readPositiveInt("-5", 12)).toBe(12);
    expect(readPositiveInt("30", 12)).toBe(30);
  });
});
