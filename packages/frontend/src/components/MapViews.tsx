import { AnimatePresence, motion } from 'motion/react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { ArrowLeft, Building2, MapPinned, TrendingUp } from 'lucide-react';
import type { CityPoint, CountrySummary, GeoJsonCollection, StateSummary } from '../types';
import { getBubbleSize, getCityEmissionColor, getEmissionIntensityColor } from '../lib/emissions';
import { cn, formatMt, formatPopulation } from '../lib/format';
import { Badge, GlassCard } from './ui';

const WORLD_ATLAS = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function extractStateName(properties: Record<string, unknown>) {
  return (
    properties.ST_NM ??
    properties.NAME_1 ??
    properties.name ??
    properties.NAME ??
    properties.state_name ??
    ''
  ).toString();
}

function normalizeStateName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/nct of /g, '')
    .replace(/state of /g, '')
    .replace(/jammu and kashmir/g, 'jammu and kashmir')
    .replace(/orissa/g, 'odisha')
    .replace(/uttaranchal/g, 'uttarakhand')
    .replace(/telengana/g, 'telangana')
    .replace(/[^a-z]/g, '');
}

function stateLookup(states: StateSummary[]) {
  return Object.fromEntries(
    states.map((state) => [normalizeStateName(state.name), state])
  );
}

export function BreadcrumbTrail({
  country,
  selectedState,
}: {
  country: CountrySummary;
  selectedState?: StateSummary | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
      <a href="/" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:bg-white/10">
        Globe
      </a>
      <span>/</span>
      <a
        href={`/country/${country.code}`}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:bg-white/10"
      >
        {country.name}
      </a>
      <span>/</span>
      <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-sky-200">State</span>
      {selectedState ? (
        <>
          <span>/</span>
          <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-violet-200">City</span>
        </>
      ) : null}
    </div>
  );
}

export function IndiaStateMap({
  geoJson,
  states,
  onSelectState,
}: {
  geoJson: GeoJsonCollection;
  states: StateSummary[];
  onSelectState: (state: StateSummary) => void;
}) {
  const lookup = stateLookup(states);
  const topState = [...states].sort((a, b) => b.emissions - a.emissions)[0];

  return (
    <div className="space-y-5">
      <GlassCard className="overflow-hidden p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-sky-200/75">India Drill-down</div>
            <h3 className="font-display text-xl text-white">State intensity choropleth</h3>
          </div>
          {topState ? <Badge tone="orange">Top state: {topState.name}</Badge> : null}
        </div>
        <div className="rounded-[24px] border border-white/10 bg-[#08101c] p-3">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 900, center: [82, 23] }}
            className="h-[560px] w-full"
          >
            <ZoomableGroup center={[82, 23]} zoom={1}>
              <Geographies geography={geoJson}>
                {({ geographies }: { geographies: Array<{ rsmKey: string; properties: Record<string, unknown> }> }) =>
                  geographies.map((geo) => {
                    const name = extractStateName(geo.properties);
                    const state = lookup[normalizeStateName(name)];
                    const fill = state ? getEmissionIntensityColor(state.emissions) : 'rgba(148,163,184,0.18)';
                    const sectors = state?.topSectors.map((sector) => sector.name).join(', ');
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => state && onSelectState(state)}
                        style={{
                          default: {
                            fill,
                            stroke: 'rgba(255,255,255,0.2)',
                            strokeWidth: 0.6,
                            outline: 'none',
                          },
                          hover: {
                            fill: state ? '#38BDF8' : fill,
                            stroke: '#E2E8F0',
                            strokeWidth: 1,
                            outline: 'none',
                            cursor: state ? 'pointer' : 'default',
                          },
                          pressed: {
                            fill: state ? '#A78BFA' : fill,
                            outline: 'none',
                          },
                        }}
                      >
                        <title>
                          {state
                            ? `${state.name} • ${formatMt(state.emissions)} • Population ${formatPopulation(state.population)} • Top sectors: ${sectors}`
                            : name}
                        </title>
                      </Geography>
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-3">
        {states.slice(0, 3).map((state) => (
          <GlassCard key={state.code}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-lg text-white">{state.name}</div>
                <div className="mt-1 text-sm text-slate-400">Population {formatPopulation(state.population)}</div>
              </div>
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: getEmissionIntensityColor(state.emissions) }}
              />
            </div>
            <div className="mt-4 text-2xl font-semibold text-white">{formatMt(state.emissions)}</div>
            <button
              type="button"
              onClick={() => onSelectState(state)}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Explore cities
              <TrendingUp className="h-4 w-4" />
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

export function CityBubbleMap({
  state,
  cities,
  onBack,
}: {
  state: StateSummary;
  cities: CityPoint[];
  onBack: () => void;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.code}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to states
          </button>
          <Badge tone="violet">City bubble view</Badge>
        </div>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <GlassCard className="overflow-hidden p-4 md:p-5">
            <div className="rounded-[24px] border border-white/10 bg-[#08101c] p-3">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 2500, center: [state.lng, state.lat] }}
                className="h-[540px] w-full"
              >
                <ZoomableGroup center={[state.lng, state.lat]} zoom={4.8}>
                  <Geographies geography={WORLD_ATLAS}>
                    {({ geographies }: { geographies: Array<{ rsmKey: string }> }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          style={{
                            default: {
                              fill: '#0f172a',
                              stroke: 'rgba(255,255,255,0.08)',
                              strokeWidth: 0.4,
                              outline: 'none',
                            },
                            hover: { fill: '#0f172a', outline: 'none' },
                            pressed: { fill: '#0f172a', outline: 'none' },
                          }}
                        />
                      ))
                    }
                  </Geographies>
                  {cities.map((city) => (
                    <Marker key={city.name} coordinates={[city.lng, city.lat]}>
                      <circle
                        r={getBubbleSize(city.estimatedEmissions)}
                        fill={getCityEmissionColor(city.estimatedEmissions)}
                        fillOpacity={0.8}
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth={1.2}
                      />
                      <title>{`${city.name} • ${formatMt(city.estimatedEmissions)}`}</title>
                    </Marker>
                  ))}
                </ZoomableGroup>
              </ComposableMap>
            </div>
          </GlassCard>
          <GlassCard className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-violet-200/75">State snapshot</div>
                <h3 className="font-display text-2xl text-white">{state.name}</h3>
              </div>
              <Building2 className="h-5 w-5 text-violet-200" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">State emissions</div>
                <div className="mt-2 text-2xl font-semibold text-white">{formatMt(state.emissions)}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Population</div>
                <div className="mt-2 text-2xl font-semibold text-white">{formatPopulation(state.population)}</div>
              </div>
            </div>
            <div className="space-y-3">
              {cities.map((city) => (
                <div key={city.name} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{city.name}</div>
                      <div className="text-sm text-slate-400">Population {formatPopulation(city.population)}</div>
                    </div>
                    <span
                      className="inline-flex h-4 w-4 rounded-full"
                      style={{ backgroundColor: getCityEmissionColor(city.estimatedEmissions) }}
                    />
                  </div>
                  <div className="mt-3 text-lg font-semibold text-white">{formatMt(city.estimatedEmissions)}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function CountryMarkerMap({
  country,
  cities,
}: {
  country: CountrySummary;
  cities: CityPoint[];
}) {
  const zoom = country.code === 'RUS' || country.code === 'CAN' ? 1.75 : 2.4;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_360px]">
      <GlassCard className="overflow-hidden p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-sky-200/75">Country marker view</div>
            <h3 className="font-display text-xl text-white">Urban emission hotspots</h3>
          </div>
          <Badge tone="sky">Live marker intensity</Badge>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-[#08101c] p-3">
          <ComposableMap projection="geoMercator" className="h-[560px] w-full">
            <ZoomableGroup center={[country.lng, country.lat]} zoom={zoom}>
              <Geographies geography={WORLD_ATLAS}>
                {({ geographies }: { geographies: Array<{ rsmKey: string }> }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: '#102033',
                          stroke: 'rgba(255,255,255,0.08)',
                          strokeWidth: 0.5,
                          outline: 'none',
                        },
                        hover: { fill: '#13263d', outline: 'none' },
                        pressed: { fill: '#13263d', outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>
              {cities.map((city) => (
                <Marker key={city.name} coordinates={[city.lng, city.lat]}>
                  <circle
                    r={getBubbleSize(city.estimatedEmissions)}
                    fill={getCityEmissionColor(city.estimatedEmissions)}
                    fillOpacity={0.85}
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth={1.1}
                  />
                  <title>{`${city.name} • ${formatMt(city.estimatedEmissions)}`}</title>
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </GlassCard>
      <GlassCard className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-sky-200/75">Marker summary</div>
            <h3 className="font-display text-2xl text-white">{country.name}</h3>
          </div>
          <MapPinned className="h-5 w-5 text-sky-200" />
        </div>
        {cities.map((city) => (
          <div key={city.name} className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-white">{city.name}</div>
                <div className="mt-1 text-sm text-slate-400">
                  Population {formatPopulation(city.population)}
                </div>
              </div>
              <div
                className={cn('h-4 w-4 rounded-full')}
                style={{ backgroundColor: getCityEmissionColor(city.estimatedEmissions) }}
              />
            </div>
            <div className="mt-3 text-xl font-semibold text-white">{formatMt(city.estimatedEmissions)}</div>
            {city.topSector ? <div className="mt-1 text-sm text-slate-400">Top sector: {city.topSector}</div> : null}
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
