import { useQuery } from "@tanstack/react-query";

const CCGLOBAL_BASE = "https://ccglobal.openearth.dev/api/v0";

interface RawCityAttrs {
  populationSize: number | null;
  area_km2: number | null;
  populationDensity: number | null;
}

export interface CityAttributesStats {
  population: string | null;
  area: string | null;
  populationDensity: string | null;
  isLoading: boolean;
}

export function useCityAttributes(locode: string): CityAttributesStats {
  const { data, isLoading } = useQuery<RawCityAttrs | null>({
    queryKey: ["city-attributes", locode],
    queryFn: async () => {
      if (!locode) return null;
      const res = await fetch(
        `${CCGLOBAL_BASE}/city_attributes/${encodeURIComponent(locode)}`
      );
      if (!res.ok) return null;
      const json = await res.json();
      return (json.city ?? null) as RawCityAttrs | null;
    },
    enabled: Boolean(locode),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (!data) return { population: null, area: null, populationDensity: null, isLoading };

  return {
    population:
      data.populationSize != null
        ? data.populationSize.toLocaleString("en")
        : null,
    area:
      data.area_km2 != null
        ? `${data.area_km2.toLocaleString("en")} km²`
        : null,
    populationDensity:
      data.populationDensity != null
        ? `${data.populationDensity.toFixed(2)} hab/km²`
        : null,
    isLoading,
  };
}
