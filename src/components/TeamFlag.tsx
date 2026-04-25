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
};

interface TeamFlagProps {
  code: string;
  name: string;
  className?: string;
}

export function TeamFlag({ code, name, className = "w-8 h-6" }: TeamFlagProps) {
  const iso2 = codeToIso2[code] || code.slice(0, 2).toLowerCase();
  const src = `https://flagcdn.com/w80/${iso2}.png`;

  return (
    <img
      src={src}
      alt={`Bandeira ${name}`}
      className={`${className} object-cover rounded-sm`}
      loading="lazy"
      onError={(e) => {
        // Fallback: hide image on error
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
