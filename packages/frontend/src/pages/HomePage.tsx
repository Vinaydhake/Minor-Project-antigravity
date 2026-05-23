import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Globe2, Leaf, Radar, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';
import { EmissionGlobe } from '../components/EmissionGlobe';
import { fetchCountries } from '../lib/api';
import { getEmissionIntensityColor, sortCountriesByRank } from '../lib/emissions';
import { formatMt, formatPercent, formatPopulation } from '../lib/format';
import { ErrorState, GlassCard, LoadingState, MetricTile, SectionTitle } from '../components/ui';

function GlobalStatsPanel() {
  const countriesQuery = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  });

  if (countriesQuery.isLoading) {
    return <LoadingState label="Building the global summary panel..." />;
  }

  if (countriesQuery.isError || !countriesQuery.data) {
    return (
      <ErrorState
        title="Global stats unavailable"
        description="The country summary feed didn’t load, so the overview panel can’t render yet."
      />
    );
  }

  const countries = sortCountriesByRank(countriesQuery.data);
  const totalKnownEmissions = countries.reduce((sum, country) => sum + country.totalEmissions, 0);
  const averagePerCapita =
    countries.reduce((sum, country) => sum + country.perCapita, 0) / countries.length;
  const topEmitter = countries[0];
  const highEmitters = countries.filter((country) => country.totalEmissions > 1000).length;

  return (
    <GlassCard className="h-full space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.26em] text-sky-200/75">Global Stats Panel</div>
        <h3 className="mt-2 font-display text-2xl text-white">Signal from the full tracked set</h3>
        <p className="mt-2 text-sm text-slate-300">
          Synthetic but structured country data with live trend modeling, sector mix, and drill-down routing.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <MetricTile label="Tracked emissions" value={formatMt(totalKnownEmissions)} tone="green" />
        <MetricTile label="Average per-capita" value={`${averagePerCapita.toFixed(2)} tCO2e`} tone="sky" />
        <MetricTile label="Very high emitters" value={`${highEmitters}`} tone="orange" />
        <MetricTile label="Countries covered" value={`${countries.length}`} tone="violet" />
      </div>
      <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Current #1 emitter</div>
            <div className="mt-2 font-display text-xl text-white">{topEmitter.name}</div>
          </div>
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: getEmissionIntensityColor(topEmitter.totalEmissions) }}
          />
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <div>{formatMt(topEmitter.totalEmissions)}</div>
          <div>Population {formatPopulation(topEmitter.population)}</div>
          <div>Forest coverage {formatPercent(topEmitter.forestCoverage)}</div>
        </div>
      </div>
      <div className="rounded-[26px] border border-white/10 bg-[#0b1220] p-4">
        <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Intensity legend</div>
        <div className="space-y-3">
          {[
            ['Low', '< 50 Mt', '#22C55E'],
            ['Medium', '50 - 200 Mt', '#EAB308'],
            ['High', '200 - 1000 Mt', '#F97316'],
            ['Very high', '> 1000 Mt', '#EF4444'],
          ].map(([label, range, color]) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm text-white">{label}</span>
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{range}</span>
            </div>
          ))}
        </div>
      </div>
      <Link href="/analyzer" className="inline-flex items-center gap-2 text-sm font-medium text-sky-200 transition hover:text-white">
        Open the personal analyzer
        <ArrowRight className="h-4 w-4" />
      </Link>
    </GlassCard>
  );
}

export function HomePage() {
  const countriesQuery = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  });

  if (countriesQuery.isLoading) {
    return <LoadingState />;
  }

  if (countriesQuery.isError || !countriesQuery.data) {
    return (
      <ErrorState
        description="EarthPulse couldn’t load the country dataset for the globe view. Check the backend API and try again."
      />
    );
  }

  const countries = countriesQuery.data;

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="EarthPulse"
        title="Global GHG Emissions Explorer"
        description="A dark, atmospheric dashboard for exploring national emissions, trend forecasts, and urban hotspots across the globe."
        action={
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
              <Globe2 className="h-4 w-4 text-sky-200" />
              3D globe + map drill-downs
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
              <TrendingUp className="h-4 w-4 text-violet-200" />
              OLS forecast 2024-2030
            </div>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <EmissionGlobe countries={countries} />
        <GlobalStatsPanel />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <GlassCard>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-green-400/20 bg-green-500/10 p-3 text-green-200">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl text-white">Intensity-led storytelling</h3>
              <p className="mt-2 text-sm text-slate-300">
                Every country and city marker inherits its color from emission magnitude, so the interface reads like a live climate heat map.
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-3 text-sky-200">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl text-white">Country-to-city drill-down</h3>
              <p className="mt-2 text-sm text-slate-300">
                India opens into a full state choropleth and then into city bubbles, while other countries jump straight into metro hotspot mapping.
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-200">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl text-white">Forecast confidence bands</h3>
              <p className="mt-2 text-sm text-slate-300">
                The country detail view projects 2024-2030 with linear regression, a visible Now separator, and a shaded confidence region.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
