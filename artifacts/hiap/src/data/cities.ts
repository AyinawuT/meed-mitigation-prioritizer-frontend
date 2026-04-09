export interface CityData {
  locode: string;
  name: string;
  country: string;
  region: string;
  emissions: string;
  emissionsYear: string;
  population: string;
  area: string;
  populationDensity: string;
  biome: string;
  mapUrl: string;
  joinedYear: number;
}

export const CITIES: CityData[] = [
  {
    locode: "CL IQQ",
    name: "Iquique",
    country: "Chile",
    region: "Tarapacá",
    emissions: "9,118,054 tCO₂e",
    emissionsYear: "2023",
    population: "214,857",
    area: "2,242 km²",
    populationDensity: "95.8 hab/km²",
    biome: "Atacama Desert",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-70.22,-20.35,-70.06,-20.17&layer=mapnik",
    joinedYear: 2024,
  },
  {
    locode: "CL AHP",
    name: "Alto Hospicio",
    country: "Chile",
    region: "Tarapacá",
    emissions: "2,340,000 tCO₂e",
    emissionsYear: "2023",
    population: "128,312",
    area: "572 km²",
    populationDensity: "224.3 hab/km²",
    biome: "Atacama Desert",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-70.12,-20.30,-70.00,-20.22&layer=mapnik",
    joinedYear: 2024,
  },
  {
    locode: "CL ANF",
    name: "Antofagasta",
    country: "Chile",
    region: "Antofagasta",
    emissions: "12,100,000 tCO₂e",
    emissionsYear: "2023",
    population: "402,651",
    area: "3,045 km²",
    populationDensity: "132.2 hab/km²",
    biome: "Atacama Desert",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-70.47,-23.72,-70.36,-23.56&layer=mapnik",
    joinedYear: 2024,
  },
  {
    locode: "CL ARI",
    name: "Arica",
    country: "Chile",
    region: "Arica y Parinacota",
    emissions: "4,820,000 tCO₂e",
    emissionsYear: "2023",
    population: "247,552",
    area: "4,799 km²",
    populationDensity: "51.6 hab/km²",
    biome: "Atacama Desert",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-70.34,-18.52,-70.29,-18.46&layer=mapnik",
    joinedYear: 2024,
  },
  {
    locode: "CL MJS",
    name: "Mejillones",
    country: "Chile",
    region: "Antofagasta",
    emissions: "1,230,000 tCO₂e",
    emissionsYear: "2023",
    population: "12,954",
    area: "2,040 km²",
    populationDensity: "6.3 hab/km²",
    biome: "Atacama Desert",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-70.47,-23.12,-70.38,-23.06&layer=mapnik",
    joinedYear: 2025,
  },
  {
    locode: "CL TTC",
    name: "Taltal",
    country: "Chile",
    region: "Antofagasta",
    emissions: "870,000 tCO₂e",
    emissionsYear: "2023",
    population: "13,602",
    area: "20,300 km²",
    populationDensity: "0.7 hab/km²",
    biome: "Atacama Desert",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-70.52,-25.43,-70.44,-25.38&layer=mapnik",
    joinedYear: 2025,
  },
  {
    locode: "CL PIC",
    name: "Pica",
    country: "Chile",
    region: "Tarapacá",
    emissions: "240,000 tCO₂e",
    emissionsYear: "2023",
    population: "10,450",
    area: "14,262 km²",
    populationDensity: "0.7 hab/km²",
    biome: "Atacama Desert",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-69.34,-20.52,-69.26,-20.46&layer=mapnik",
    joinedYear: 2025,
  },
  {
    locode: "CL HUA",
    name: "Huara",
    country: "Chile",
    region: "Tarapacá",
    emissions: "92,000 tCO₂e",
    emissionsYear: "2023",
    population: "3,127",
    area: "9,847 km²",
    populationDensity: "0.3 hab/km²",
    biome: "Atacama Desert",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-69.80,-19.99,-69.72,-19.93&layer=mapnik",
    joinedYear: 2025,
  },
  {
    locode: "CL CMA",
    name: "Camiña",
    country: "Chile",
    region: "Tarapacá",
    emissions: "38,000 tCO₂e",
    emissionsYear: "2023",
    population: "1,298",
    area: "2,198 km²",
    populationDensity: "0.6 hab/km²",
    biome: "Andean Puna",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-69.43,-19.32,-69.36,-19.26&layer=mapnik",
    joinedYear: 2025,
  },
  {
    locode: "CL CNE",
    name: "Colchane",
    country: "Chile",
    region: "Tarapacá",
    emissions: "22,000 tCO₂e",
    emissionsYear: "2023",
    population: "1,728",
    area: "4,066 km²",
    populationDensity: "0.4 hab/km²",
    biome: "Andean Puna",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-68.65,-19.29,-68.57,-19.23&layer=mapnik",
    joinedYear: 2025,
  },
  {
    locode: "CL SIG",
    name: "Sierra Gorda",
    country: "Chile",
    region: "Antofagasta",
    emissions: "310,000 tCO₂e",
    emissionsYear: "2023",
    population: "1,867",
    area: "8,895 km²",
    populationDensity: "0.2 hab/km²",
    biome: "Atacama Desert",
    mapUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-69.40,-22.98,-69.32,-22.92&layer=mapnik",
    joinedYear: 2025,
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
  return CITIES.filter((c) => c.name.toLowerCase().includes(q));
}

export const STATS = [
  { value: "155", label: "Mitigation actions" },
  { value: "11", label: "Cities onboarded" },
  { value: "5", label: "GPC sectors covered" },
  { value: "1–2 min", label: "Time to recommendations" },
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
