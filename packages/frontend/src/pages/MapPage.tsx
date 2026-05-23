import { useQuery } from '@tanstack/react-query';
import { startTransition, useState } from 'react';
import { fetchCountry, fetchCountryCities, fetchIndiaGeoJson, fetchStateCities, fetchStates } from '../lib/api';
import { sortCitiesByEmission, sortStatesByEmission } from '../lib/emissions';
import { BreadcrumbTrail, CityBubbleMap, CountryMarkerMap, IndiaStateMap } from '../components/MapViews';
import { ErrorState, GlassCard, LoadingState, SectionTitle } from '../components/ui';
import type { StateSummary } from '../types';

export function MapPage({ code }: { code: string }) {
  const [selectedState, setSelectedState] = useState<StateSummary | null>(null);

  const countryQuery = useQuery({
    queryKey: ['country', code],
    queryFn: () => fetchCountry(code),
  });

  const statesQuery = useQuery({
    queryKey: ['states', code],
    queryFn: () => fetchStates(code),
    enabled: code === 'IND',
  });

  const indiaGeoQuery = useQuery({
    queryKey: ['india-geojson'],
    queryFn: fetchIndiaGeoJson,
    enabled: code === 'IND',
  });

  const stateCitiesQuery = useQuery({
    queryKey: ['state-cities', selectedState?.code],
    queryFn: () => fetchStateCities(selectedState!.code),
    enabled: Boolean(selectedState?.code),
  });

  const countryCitiesQuery = useQuery({
    queryKey: ['country-cities', code],
    queryFn: () => fetchCountryCities(code),
    enabled: code !== 'IND',
  });

  if (countryQuery.isLoading) {
    return <LoadingState label="Preparing geographic drill-downs..." />;
  }

  if (countryQuery.isError || !countryQuery.data) {
    return (
      <ErrorState
        title="Map view unavailable"
        description="The requested country could not be loaded for map exploration."
      />
    );
  }

  const country = countryQuery.data;

  const handleSelectState = (state: StateSummary) => {
    startTransition(() => {
      setSelectedState(state);
    });
  };

  const handleBack = () => {
    startTransition(() => {
      setSelectedState(null);
    });
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Map View"
        title={`${country.name} geographic drill-down`}
        description="Trace the national picture into state polygons for India or city marker clusters for the rest of the world."
      />

      <BreadcrumbTrail country={country} selectedState={selectedState} />

      {code === 'IND' ? (
        statesQuery.isLoading || indiaGeoQuery.isLoading ? (
          <LoadingState label="Loading India state polygons and emissions overlays..." />
        ) : statesQuery.isError || indiaGeoQuery.isError || !statesQuery.data || !indiaGeoQuery.data ? (
          <ErrorState
            title="India map unavailable"
            description="The India polygon layer or state emissions data failed to load."
          />
        ) : selectedState ? (
          stateCitiesQuery.isLoading || !stateCitiesQuery.data ? (
            <LoadingState label="Loading city bubble data for the selected state..." />
          ) : stateCitiesQuery.isError ? (
            <ErrorState
              title="City view unavailable"
              description="The selected state loaded, but its city emissions markers didn’t arrive."
              actionLabel="Back to states"
              onAction={handleBack}
            />
          ) : (
            <CityBubbleMap
              state={selectedState}
              cities={sortCitiesByEmission(stateCitiesQuery.data)}
              onBack={handleBack}
            />
          )
        ) : (
          <IndiaStateMap
            geoJson={indiaGeoQuery.data}
            states={sortStatesByEmission(statesQuery.data)}
            onSelectState={handleSelectState}
          />
        )
      ) : countryCitiesQuery.isLoading ? (
        <LoadingState label="Mapping urban markers for the selected country..." />
      ) : countryCitiesQuery.isError || !countryCitiesQuery.data ? (
        <ErrorState
          title="Country marker map unavailable"
          description="City markers for this country weren’t available from the backend."
        />
      ) : (
        <CountryMarkerMap country={country} cities={sortCitiesByEmission(countryCitiesQuery.data)} />
      )}

      <GlassCard>
        <p className="text-sm text-slate-300">
          State and city layers in EarthPulse are synthetic, but the interaction model is built to mimic a real exploration workflow: national overview, state hotspot scan, and city-level bubble comparisons.
        </p>
      </GlassCard>
    </div>
  );
}
