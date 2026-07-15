import antRaw from "@/data/inventories/CL-ANT.json";
import canRaw from "@/data/inventories/CL-CAN.json";
import conRaw from "@/data/inventories/CL-CON.json";
import fruRaw from "@/data/inventories/CL-FRU.json";
import lagRaw from "@/data/inventories/CL-LAG.json";
import lapRaw from "@/data/inventories/CL-LAP.json";
import maiRaw from "@/data/inventories/CL-MAI.json";
import paiRaw from "@/data/inventories/CL-PAI.json";
import panRaw from "@/data/inventories/CL-PAN.json";
import penRaw from "@/data/inventories/CL-PEN.json";
import proRaw from "@/data/inventories/CL-PRO.json";
import puaRaw from "@/data/inventories/CL-PUA.json";
import pueRaw from "@/data/inventories/CL-PUE.json";
import quiRaw from "@/data/inventories/CL-QUI.json";
import renRaw from "@/data/inventories/CL-REN.json";
import sagRaw from "@/data/inventories/CL-SAG.json";
import sanRaw from "@/data/inventories/CL-SAN.json";
import temRaw from "@/data/inventories/CL-TEM.json";
import valRaw from "@/data/inventories/CL-VAL.json";
import vpaRaw from "@/data/inventories/CL-VPA.json";

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
// import it here, and add an entry to INVENTORY_REGISTRY keyed by the city's
// locode as it appears in cities.ts (which may differ from the JSON's city.locode).

const INVENTORY_REGISTRY: Record<string, CityCatalystInventory> = {
  "CL ANT": antRaw as CityCatalystInventory,  // Antofagasta
  "CL CAN": canRaw as CityCatalystInventory,  // Canela
  "CL CCP": conRaw as CityCatalystInventory,  // Concepción
  "CL FRT": fruRaw as CityCatalystInventory,  // Frutillar
  "CL RNC": lagRaw as CityCatalystInventory,  // Lago Ranco
  "CL13112": lapRaw as CityCatalystInventory, // La Pintana
  "CL MAI": maiRaw as CityCatalystInventory,  // Maipú
  "CL PAO": paiRaw as CityCatalystInventory,  // Paillaco
  "CL PAN": panRaw as CityCatalystInventory,  // Panguipulli
  "CL PEN": penRaw as CityCatalystInventory,  // Peñalolén
  "CL PRO": proRaw as CityCatalystInventory,  // Providencia
  "CL PTA": puaRaw as CityCatalystInventory,  // Puente Alto
  "CL PMC": pueRaw as CityCatalystInventory,  // Puerto Montt
  "CL QUI": quiRaw as CityCatalystInventory,  // Quilicura
  "CL REN": renRaw as CityCatalystInventory,  // Renca
  "CL SCL": sagRaw as CityCatalystInventory,  // Santiago
  "CL SNI": sanRaw as CityCatalystInventory,  // San Nicolás
  "CL ZCO": temRaw as CityCatalystInventory,  // Temuco
  "CL ZAL": valRaw as CityCatalystInventory,  // Valdivia
  "CL VAP": vpaRaw as CityCatalystInventory,  // Valparaíso
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

/**
 * Convert a raw CityCatalyst inventory into the shape expected by the
 * prioritisation API (`FrontendCityEmissionsData`).
 * Returns null when no inventory exists for the given locode.
 */
export function getInventoryAsEmissionsData(locode: string): {
  inventoryYear: number;
  gpcData: Record<string, {
    notationKey: null;
    activities: Array<{
      activityType: string | null;
      totalEmissions: number;
      totalEmissionsUnit: string;
      activityValue: null;
      activityUnit: null;
      dataSource: null;
      notationKey: null;
    }>;
  }>;
} | null {
  const raw = INVENTORY_REGISTRY[locode.toUpperCase()];
  if (!raw) return null;
  const { year, inventoryValues } = raw.data;
  const gpcData: Record<string, {
    notationKey: null;
    activities: Array<{
      activityType: string | null;
      totalEmissions: number;
      totalEmissionsUnit: string;
      activityValue: null;
      activityUnit: null;
      dataSource: null;
      notationKey: null;
    }>;
  }> = {};
  for (const inv of inventoryValues) {
    const co2 = inv.co2eq ? parseFloat(inv.co2eq) : null;
    if (!co2 || co2 <= 0) continue;
    gpcData[inv.gpcReferenceNumber] = {
      notationKey: null,
      activities: [{
        activityType: inv.subSector?.subsectorName ?? null,
        totalEmissions: co2,
        totalEmissionsUnit: "t CO2e",
        activityValue: null,
        activityUnit: null,
        dataSource: null,
        notationKey: null,
      }],
    };
  }
  return { inventoryYear: year, gpcData };
}
