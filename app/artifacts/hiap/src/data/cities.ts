export interface CityData {
  locode: string;
  name: string;
  country: string;
  region: string;
  comunaCode: string;
  regionCode: string;
  emissions: string | null;
  emissionsYear: string | null;
  population: string | null;
  area: string | null;
  populationDensity: string | null;
  biome: string | null;
  mapUrl: string | null;
}

export const CITIES: CityData[] = [
  {
    locode: 'CL ZAL',
    name: 'Valdivia',
    country: 'Chile',
    region: 'Los Ríos',
    comunaCode: 'CL14101',
    regionCode: 'CL14',
    emissions: null,
    emissionsYear: '2020',
    population: null,
    area: null,
    populationDensity: null,
    biome: null,
    mapUrl: null,
  },
];

export const CITIES_BY_LOCODE: Record<string, CityData> = Object.fromEntries(
  CITIES.map((c) => [c.locode, c])
);

export const CITIES_BY_NAME: Record<string, CityData> = Object.fromEntries(
  CITIES.map((c) => [c.name.toLowerCase(), c])
);

export function searchCities(query: string): CityData[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  return CITIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)
  );
}

export const STATS = [
  { value: '155', label: 'Mitigation actions' },
  { value: '345', label: 'Comunas covered' },
  { value: '5', label: 'GPC sectors covered' },
  { value: '1–2 min', label: 'Time to recommendations' },
];

export const HOW_STEPS = [
  {
    n: "1",
    title: "Select your city",
    desc: "Search by city name to find your city's profile.",
  },
  {
    n: "2",
    title: "Complete your profile",
    desc: "Review and confirm emissions data, socioeconomic context, regulations & laws, policy alignment, and strategic preferences.",
  },
  {
    n: "3",
    title: "Generate recommendations",
    desc: "Run MEED+ HIAP's scoring pipeline across 155 mitigation actions ranked for your city.",
  },
  {
    n: "4",
    title: "Act on the ranking",
    desc: "Download your ranked action plan and share with your city's climate team.",
  },
];
