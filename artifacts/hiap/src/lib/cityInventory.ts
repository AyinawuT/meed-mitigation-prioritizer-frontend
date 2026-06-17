import iqqRaw from "@/data/inventories/CL-IQQ.json";
import zalRaw from "@/data/inventories/CL-ZAL.json";

// ─── CityCatalyst JSON types ──────────────────────────────────────────────────

interface RawInventoryValue {
  gpcReferenceNumber: string;
  co2eq: string | null;
  subSector: { subsectorName: string } | null;
}

interface CityCatalystInventory {
  data: {
    inventoryName: string;
    year: number;
    city: { locode: string; name: string };
    inventoryValues: RawInventoryValue[];
  };
}

// ─── Output types ─────────────────────────────────────────────────────────────

export interface EmissionSectorRow {
  sector: string;
  sub: string;
  ref: string;
  emissions: number | null;
  share: number | null;
  source: string | null;
  status: "Confirmed" | "Not mapped";
}

export interface ParsedCityInventory {
  inventoryName: string;
  year: number;
  locode: string;
  cityName: string;
  rows: EmissionSectorRow[];
}

// ─── Sector config ────────────────────────────────────────────────────────────

const SECTOR_CONFIG = [
  { prefix: "I",   name: "Stationary Energy",                           refRange: "I.1–I.8"  },
  { prefix: "II",  name: "Transportation",                              refRange: "II.1–II.5" },
  { prefix: "III", name: "Waste",                                       refRange: "III.1–III.4" },
  { prefix: "IV",  name: "Industrial Processes & Product Use (IPPU)",   refRange: "IV.1–IV.4" },
  { prefix: "V",   name: "Agriculture, Forestry & Other Land Use (AFOLU)", refRange: "V.1–V.3" },
] as const;

// Extract the Roman numeral sector prefix from a GPC reference, e.g. "II.1.1" → "II"
function gpcSectorPrefix(ref: string): string {
  return ref.split(".")[0];
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseInventory(raw: CityCatalystInventory): ParsedCityInventory {
  const { inventoryName, year, city, inventoryValues } = raw.data;

  const rows: EmissionSectorRow[] = SECTOR_CONFIG.map(({ prefix, name, refRange }) => {
    const values = inventoryValues.filter(
      (v) =>
        gpcSectorPrefix(v.gpcReferenceNumber) === prefix &&
        v.co2eq !== null &&
        parseFloat(v.co2eq) > 0
    );

    if (values.length === 0) {
      return {
        sector: name,
        sub: refRange,
        ref: refRange,
        emissions: null,
        share: null,
        source: null,
        status: "Not mapped",
      };
    }

    const totalEmissions = values.reduce(
      (sum, v) => sum + parseFloat(v.co2eq ?? "0"),
      0
    );

    // Unique sub-sector names, deduplicated, joined with " · "
    const subNames = [
      ...new Set(
        values
          .map((v) => v.subSector?.subsectorName)
          .filter((n): n is string => Boolean(n))
      ),
    ];
    const sub = subNames.length > 0 ? subNames.join(" · ") : refRange;

    return {
      sector: name,
      sub,
      ref: refRange,
      emissions: Math.round(totalEmissions),
      share: null,
      source: `CityCatalyst Inventory ${year}`,
      status: "Confirmed",
    };
  });

  // Back-fill percentage shares
  const total = rows.reduce((sum, r) => sum + (r.emissions ?? 0), 0);
  const rowsWithShare = rows.map((r) => ({
    ...r,
    share:
      r.emissions !== null && total > 0
        ? parseFloat(((r.emissions / total) * 100).toFixed(1))
        : null,
  }));

  return {
    inventoryName,
    year,
    locode: city.locode,
    cityName: city.name,
    rows: rowsWithShare,
  };
}

// ─── Registry ─────────────────────────────────────────────────────────────────
// To add a new city: drop its CityCatalyst JSON into src/data/inventories/,
// import it here, and add an entry to INVENTORY_REGISTRY keyed by LOCODE.

const INVENTORY_REGISTRY: Record<string, CityCatalystInventory> = {
  "CL IQQ": iqqRaw as CityCatalystInventory,
  "CL ZAL": zalRaw as CityCatalystInventory,
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getEmissionsData(locode: string): ParsedCityInventory | null {
  const raw = INVENTORY_REGISTRY[locode.toUpperCase()];
  if (!raw) return null;
  return parseInventory(raw);
}

/** Returns the inventory year as a string, or null if no inventory exists. */
export function getInventoryYear(locode: string): string | null {
  const raw = INVENTORY_REGISTRY[locode.toUpperCase()];
  if (!raw) return null;
  return String(raw.data.year);
}

/** Returns a compact formatted total, e.g. "9.08M tCO₂e", or null if no inventory exists. */
export function getFormattedTotalEmissions(locode: string): string | null {
  const data = getEmissionsData(locode);
  if (!data) return null;
  const total = data.rows.reduce((sum, r) => sum + (r.emissions ?? 0), 0);
  if (total === 0) return null;
  const millions = total / 1_000_000;
  return `${millions.toFixed(2)}M tCO₂e`;
}
