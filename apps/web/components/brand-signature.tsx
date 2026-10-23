import Image from "next/image";
import { OpenStrataSymbol } from "./open-strata-symbol";

export function divisionName(division: string) {
  if (division === "STRATA" || division === "STRATA ESG") return "STRATA ESG";
  if (division === "IROKO") return "IROKO Software Group";
  if (division === "Pharivo") return "Pharivo";
  if (division === "Cockpit") return "Adama OS";
  return division;
}

export type MarqueSignature = "strata" | "pharivo" | "iroko" | "adama";

/**
 * Wordmark specified in the supplied STRATA ESG kit; Pharivo wordmark as
 * served by pharivo.com; original IROKO artwork.
 */
export function BrandSignature({
  brand,
  className = "",
}: {
  brand: MarqueSignature;
  className?: string;
}) {
  if (brand === "pharivo") {
    return <PharivoWordmark className={`brand-pharivo ${className}`} />;
  }
  if (brand === "iroko") {
    return (
      <Image
        className={`brand-iroko ${className}`}
        src="/brand/iroko-software-group.png"
        width={800}
        height={600}
        alt="IROKO Software Group"
      />
    );
  }
  if (brand === "strata") {
    return <span className={`brand-strata ${className}`}>STRATA ESG</span>;
  }
  return (
    <span
      className={`brand-adama ${className}`}
      role="img"
      aria-label="ADAMA OS"
    >
      <OpenStrataSymbol />
      <span aria-hidden="true">ADAMA OS</span>
    </span>
  );
}

// =====================================================================
// La marque Pharivo, telle que le site pharivo.com la sert.
//
// Le symbole est le phare des Mamelles, a Dakar : la tour forme la haste
// du P, le faisceau sa panse. Les traces sont repris a l'identique du
// mot-symbole publie sur pharivo.com le 23 octobre 2026, sans redessin ni
// recoloration : ils sont peints a la couleur du texte, comme dans le
// produit, et prennent donc la teinte du contexte qui les porte.
// =====================================================================

const PHARIVO_VIEWBOX = "0 -709.33 3984.89 855.16";

/** Le symbole seul, la tour et le faisceau. */
const PHARIVO_SYMBOLE = [
  "M0 -709.33H168.89V0H0Z",
  "M219.55 -709.33A371.55 371.55 0 0 1 591.11 -337.78H219.55Z",
] as const;

/** Les lettres du nom, apres le symbole. */
const PHARIVO_LETTRES = [
  "M802.22 145.83 802.56 -326.83 802.22 -525H930.06L927.22 -360.33H934.39Q945.89 -421.33 968.89 -461Q991.89 -500.67 1026.81 -519.83Q1061.72 -539 1109.39 -539Q1170.39 -539 1214.47 -508.08Q1258.56 -477.17 1282.06 -416.17Q1305.56 -355.17 1305.56 -264.67Q1305.56 -169 1279.89 -107.25Q1254.22 -45.5 1210.06 -15.83Q1165.89 13.83 1109.72 13.83Q1062.89 13.83 1027.47 -6.5Q992.05 -26.83 969.3 -67.92Q946.55 -109 937.72 -170L928.39 -169.83Q933.72 -137 937.8 -104.25Q941.89 -71.5 944.3 -41.08Q946.72 -10.67 946.72 17V145.83ZM1057.39 -106.17Q1091.56 -106.17 1114.31 -126.83Q1137.06 -147.5 1148.22 -182.58Q1159.39 -217.67 1159.39 -259.83Q1159.39 -304 1147.81 -338.92Q1136.22 -373.83 1113.56 -394.33Q1090.89 -414.83 1057.56 -414.83Q1033.72 -414.83 1013.31 -404.33Q992.89 -393.83 977.89 -374.17Q962.89 -354.5 954.3 -326.67Q945.72 -298.83 945.72 -263.33V-256.17Q945.72 -229 951.39 -206.17Q957.05 -183.33 967.05 -164.75Q977.05 -146.17 991.05 -133Q1005.06 -119.83 1021.81 -113Q1038.56 -106.17 1057.39 -106.17ZM1358.56 0V-265.67L1358.22 -695H1503.05V-561.33Q1503.05 -541.33 1500.55 -507.83Q1498.05 -474.33 1493.72 -435.5Q1489.39 -396.67 1484.89 -359.67Q1480.39 -322.67 1477.39 -295H1486.55Q1495.22 -380.67 1517.89 -434.67Q1540.56 -488.67 1579.31 -513.83Q1618.06 -539 1672.22 -539Q1757.06 -539 1798.14 -478.25Q1839.22 -417.5 1839.22 -295.67V0H1694.89V-288.83Q1694.89 -352.83 1677.47 -382.17Q1660.06 -411.5 1621.89 -411.5Q1587.06 -411.5 1560.39 -386.08Q1533.72 -360.67 1518.3 -307.67Q1502.89 -254.67 1502.89 -173V0ZM2042.39 13.83Q2002.22 13.83 1966.64 -0.33Q1931.06 -14.5 1908.64 -45.92Q1886.22 -77.33 1886.22 -129.5Q1886.22 -177.5 1904.72 -207.58Q1923.22 -237.67 1954.81 -256.08Q1986.39 -274.5 2024.72 -284.17Q2063.06 -293.83 2101.89 -300.83Q2155.06 -310.67 2181.39 -316.58Q2207.72 -322.5 2216.97 -330.75Q2226.22 -339 2226.22 -353.67Q2226.22 -387.67 2201.97 -405.5Q2177.72 -423.33 2139.39 -423.33Q2115.56 -423.33 2091.89 -414.5Q2068.22 -405.67 2052.81 -383.92Q2037.39 -362.17 2037.39 -323L1908.22 -333.5Q1907.72 -393.67 1928.47 -433.58Q1949.22 -473.5 1984.31 -496.42Q2019.39 -519.33 2061.06 -529.17Q2102.72 -539 2144.06 -539Q2218.06 -539 2267.64 -511.33Q2317.22 -483.67 2342.14 -430.75Q2367.06 -377.83 2367.06 -301.17V-206.17Q2367.22 -172 2367.31 -137.33Q2367.39 -102.67 2367.47 -68.42Q2367.56 -34.17 2367.56 0H2241.22Q2242.06 -38.33 2242.72 -76.92Q2243.39 -115.5 2244.06 -158.17H2237.56Q2232.72 -110.83 2206.81 -71.75Q2180.89 -32.67 2138.97 -9.42Q2097.06 13.83 2042.39 13.83ZM2098.89 -93.5Q2119.39 -93.5 2141.47 -101.58Q2163.56 -109.67 2182.72 -127.17Q2201.89 -144.67 2213.89 -173.42Q2225.89 -202.17 2226.22 -242.67L2226.39 -266.33L2253.22 -270.67Q2244.39 -257 2224.31 -248.92Q2204.22 -240.83 2178.97 -236.25Q2153.72 -231.67 2127.97 -226.92Q2102.22 -222.17 2080.22 -213.83Q2058.22 -205.5 2044.55 -191.33Q2030.89 -177.17 2030.89 -152.33Q2030.89 -124.17 2050.14 -108.83Q2069.39 -93.5 2098.89 -93.5ZM2422.56 0V-276.5L2422.22 -525H2548.39L2544.72 -307.5H2553.05Q2559.05 -392.33 2576.97 -442.58Q2594.89 -492.83 2622.56 -514.83Q2650.22 -536.83 2685.06 -536.83Q2702.22 -536.83 2720.81 -532.25Q2739.39 -527.67 2757.56 -517.67L2750.06 -358.5Q2729.56 -370.17 2709.89 -375.75Q2690.22 -381.34 2672.56 -381.34Q2638.56 -381.34 2614.81 -360.33Q2591.06 -339.33 2578.55 -298.67Q2566.05 -258 2566.05 -199.83V0ZM2784.56 0V-525H2928.89V0ZM3118.89 0 2952.39 -525H3106.05L3210.89 -120.5H3215.06L3323.06 -525H3468.39L3301.89 0ZM3726.56 13.83Q3651.89 13.83 3593.56 -16.58Q3535.22 -47 3502.31 -108.25Q3469.39 -169.5 3469.39 -261.83Q3469.39 -357.17 3503.47 -418.33Q3537.56 -479.5 3596.06 -509.25Q3654.56 -539 3728.06 -539Q3804.22 -539 3862.06 -508.42Q3919.89 -477.83 3952.39 -416.5Q3984.89 -355.17 3984.89 -262Q3984.89 -166.5 3950.97 -105.42Q3917.06 -44.33 3858.56 -15.25Q3800.06 13.83 3726.56 13.83ZM3729.72 -94.33Q3764.72 -94.33 3788.89 -113Q3813.06 -131.67 3825.89 -167.75Q3838.72 -203.83 3838.72 -254.17Q3838.72 -308.67 3824.97 -346.42Q3811.22 -384.17 3785.64 -404.58Q3760.06 -425 3724.06 -425Q3689.89 -425 3665.64 -406Q3641.39 -387 3628.47 -350.67Q3615.55 -314.33 3615.55 -263.5Q3615.55 -183.67 3645.81 -139Q3676.06 -94.33 3729.72 -94.33Z",
  "M2784.56 -709.33A144.33 144.33 0 0 1 2928.89 -565H2784.56Z",
] as const;

/**
 * Le mot-symbole complet. Rendu comme une image nommee « Pharivo », sauf
 * quand il double un nom deja ecrit a cote : il est alors decoratif.
 */
function PharivoWordmark({
  className = "",
  decoratif = false,
}: {
  className?: string;
  decoratif?: boolean;
}) {
  return (
    <svg
      className={`pharivo-wordmark ${className}`.trim()}
      viewBox={PHARIVO_VIEWBOX}
      fill="currentColor"
      focusable="false"
      role={decoratif ? undefined : "img"}
      aria-label={decoratif ? undefined : "Pharivo"}
      aria-hidden={decoratif || undefined}
    >
      {[...PHARIVO_SYMBOLE, ...PHARIVO_LETTRES].map((d, rang) => (
        <path key={rang} d={d} />
      ))}
    </svg>
  );
}
