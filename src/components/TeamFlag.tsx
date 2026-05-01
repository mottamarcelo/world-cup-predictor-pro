// Map FIFA-style 3-letter codes to ISO 3166-1 alpha-2 (flagcdn) codes
const codeToIso2: Record<string, string> = {
  BRA: "br", ARG: "ar", FRA: "fr", GER: "de", ESP: "es", POR: "pt",
  ENG: "gb-eng", USA: "us", MEX: "mx", JPN: "jp", KSA: "sa", AUS: "au",
  CRC: "cr", GHA: "gh", SUI: "ch", SRB: "rs", CMR: "cm", DEN: "dk",
  URY: "uy", NED: "nl", BEL: "be", CRO: "hr", MAR: "ma", SEN: "sn",
  TUN: "tn", POL: "pl", KOR: "kr", CAN: "ca", WAL: "gb-wls", IRN: "ir",
  ECU: "ec", QAT: "qa", CHN: "cn", COL: "co", CHI: "cl", PER: "pe",
  PAR: "py", BOL: "bo", VEN: "ve", NGA: "ng", EGY: "eg", ALG: "dz",
  CAM: "cm", CIV: "ci", RSA: "za", SCO: "gb-sct", ITA: "it",
  NOR: "no", SWE: "se", FIN: "fi", AUT: "at", CZE: "cz", UKR: "ua",
  RUS: "ru", TUR: "tr", GRE: "gr", ROU: "ro", HUN: "hu", IRL: "ie",
  ISR: "il", JAM: "jm", HON: "hn", SLV: "sv", PAN: "pa", CUB: "cu",
  DOM: "do", HAI: "ht", TRI: "tt", IDN: "id", THA: "th", VNM: "vn",
  MYS: "my", PHI: "ph", SGP: "sg", IND: "in", PAK: "pk", BGD: "bd",
  NZL: "nz", CUW: "cw", CPV: "cv", UZB: "uz", JOR: "jo", AZE: "az",
  IRQ: "iq", COD: "cd", BIH: "ba",
};

// Map full country names (as stored in DB) to ISO 3166-1 alpha-2 codes
const nameToIso2: Record<string, string> = {
  "argentina": "ar",
  "algeria": "dz",
  "australia": "au",
  "austria": "at",
  "belgium": "be",
  "bosnia and herzegovina": "ba",
  "brazil": "br",
  "canada": "ca",
  "cape verde": "cv",
  "colombia": "co",
  "croatia": "hr",
  "curacao": "cw",
  "czechia": "cz",
  "democratic republic of congo": "cd",
  "ecuador": "ec",
  "egypt": "eg",
  "england": "gb-eng",
  "france": "fr",
  "germany": "de",
  "ghana": "gh",
  "haiti": "ht",
  "iran": "ir",
  "iraq": "iq",
  "ivory coast": "ci",
  "japan": "jp",
  "jordan": "jo",
  "mexico": "mx",
  "morocco": "ma",
  "netherlands": "nl",
  "new zealand": "nz",
  "norway": "no",
  "panama": "pa",
  "paraguay": "py",
  "portugal": "pt",
  "qatar": "qa",
  "saudi arabia": "sa",
  "scotland": "gb-sct",
  "senegal": "sn",
  "south africa": "za",
  "south korea": "kr",
  "spain": "es",
  "sweden": "se",
  "switzerland": "ch",
  "tunisia": "tn",
  "turkiye": "tr",
  "turkey": "tr",
  "uruguay": "uy",
  "usa": "us",
  "united states": "us",
  "uzbekistan": "uz",
  "wales": "gb-wls",
  "denmark": "dk",
  "poland": "pl",
  "serbia": "rs",
  "cameroon": "cm",
  "costa rica": "cr",
  "italy": "it",
  "russia": "ru",
  "ukraine": "ua",
  "greece": "gr",
  "romania": "ro",
  "hungary": "hu",
  "ireland": "ie",
  "israel": "il",
  "finland": "fi",
};

interface TeamFlagProps {
  code: string;
  name: string;
  className?: string;
}

function resolveIso2(code: string, name: string): string | null {
  // 1) Try 3-letter FIFA code map
  if (code && codeToIso2[code.toUpperCase()]) return codeToIso2[code.toUpperCase()];
  // 2) Try full name (DB stores full names in some rows, sometimes via `code`)
  const byCode = nameToIso2[(code ?? "").trim().toLowerCase()];
  if (byCode) return byCode;
  const byName = nameToIso2[(name ?? "").trim().toLowerCase()];
  if (byName) return byName;
  return null;
}

export function TeamFlag({ code, name, className = "w-8 h-6" }: TeamFlagProps) {
  const iso2 = resolveIso2(code, name);

  if (!iso2) {
    // Placeholder for TBD slots (group winners, etc.) — render a neutral box
    return (
      <div
        className={`${className} rounded-sm bg-muted flex items-center justify-center text-[9px] text-muted-foreground font-semibold`}
        aria-label={`Bandeira não definida: ${name}`}
      >
        ?
      </div>
    );
  }

  const src = `https://flagcdn.com/w80/${iso2}.png`;

  return (
    <img
      src={src}
      alt={`Bandeira ${name}`}
      className={`${className} object-cover rounded-sm`}
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
