import Image from "next/image";

export function divisionName(division: string) {
  if (division === "STRATA" || division === "STRATA ESG") return "STRATA ESG";
  if (division === "IROKO") return "IROKO Software Group";
  if (division === "Cockpit") return "Adama OS";
  return division;
}

/** Wordmark specified in the supplied STRATA ESG kit; original IROKO artwork. */
export function BrandSignature({
  brand,
  className = "",
}: {
  brand: "strata" | "iroko" | "adama";
  className?: string;
}) {
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
    <span className={`brand-adama ${className}`} aria-label="Adama OS">
      a<span>.</span>
    </span>
  );
}
