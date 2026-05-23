import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowRight, ChartColumnBig, MapPinned } from 'lucide-react';
import { Link } from 'wouter';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchCountry, fetchForecast } from '../lib/api';
import { formatGdp, formatMt, formatPercent, formatPopulation, titleCase } from '../lib/format';
import { Badge, ErrorState, GlassCard, LoadingState, MetricTile, SectionTitle } from '../components/ui';

export function CountryPage({ code }: { code: string }) {
  const countryQuery = useQuery({
    queryKey: ['country', code],
    queryFn: () => fetchCountry(code),
  });

  const forecastQuery = useQuery({
    queryKey: ['forecast', code],
    queryFn: () => fetchForecast(code),
  });

  if (countryQuery.isLoading || forecastQuery.isLoading) {
    return <LoadingState label="Loading country analytics and forecast model..." />;
  }

  if (countryQuery.isError || forecastQuery.isError || !countryQuery.data || !forecastQuery.data) {
    return (
      <ErrorState
        title="Country details unavailable"
        description="EarthPulse couldn’t assemble the country detail experience for this code."
      />
    );
  }

  const country = countryQuery.data;
  const forecast = forecastQuery.data;

  const historicalTrend = country.historicalData.map((point) => ({
    year: point.year,
    emissions: point.emissions,
  }));

  const forecastSeries = [
    ...forecast.history.map((point) => ({
      year: point.year,
      historical: point.emissions,
      forecast: undefined,
      bandBase: undefined,
      bandSpread: undefined,
    })),
    ...forecast.forecast.map((point) => ({
      year: point.year,
      historical: undefined,
      forecast: point.emissions,
      bandBase: point.confLower,
      bandSpread:
        point.confLower !== undefined && point.confUpper !== undefined
          ? point.confUpper - point.confLower
          : undefined,
    })),
  ];

  const trendTone =
    forecast.trend === 'increasing' ? 'orange' : forecast.trend === 'decreasing' ? 'green' : 'violet';

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Country Detail"
        title={`${country.name} emissions profile`}
        description="A synthetic national snapshot with historical trajectory, forecast confidence, sector mix, and a fast handoff into polygon or marker maps."
        action={
          <Link
            href={`/country/${country.code}/map`}
            className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-500/15"
          >
            Enter Map View
            <MapPinned className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
        <div className="space-y-5">
          <GlassCard>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Context card</div>
                <h3 className="mt-2 font-display text-3xl text-white">{country.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  EarthPulse places {country.name} at global rank #{country.rank} with {formatMt(country.totalEmissions)} in tracked emissions. The country profile combines historical data from 2015 to 2023, sector allocations, and an OLS-based forward view through 2030.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                {country.code}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-sky-200/75">Historical trend</div>
                <h3 className="font-display text-xl text-white">2015 - 2023 emissions area chart</h3>
              </div>
              <ChartColumnBig className="h-5 w-5 text-sky-200" />
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalTrend}>
                  <defs>
                    <linearGradient id="historyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#08101c',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 16,
                    }}
                  />
                  <Area type="monotone" dataKey="emissions" stroke="#38BDF8" fill="url(#historyFill)" strokeWidth={2.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-violet-200/75">Sector breakdown</div>
                <h3 className="font-display text-xl text-white">National sector mix</h3>
              </div>
              <Badge tone="violet">Horizontal bars</Badge>
            </div>
            <div className="mt-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={country.sectorBreakdown
                    .slice()
                    .sort((a, b) => b.percentage - a.percentage)
                    .map((item) => ({
                      sector: titleCase(item.sector),
                      percentage: item.percentage,
                    }))}
                  layout="vertical"
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="sector"
                    type="category"
                    width={90}
                    tick={{ fill: '#e2e8f0', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                    contentStyle={{
                      background: '#08101c',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 16,
                    }}
                  />
                  <Bar dataKey="percentage" radius={[999, 999, 999, 999]} fill="#22C55E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.36, ease: 'easeOut' }}
          className="xl:sticky xl:top-28 xl:self-start"
        >
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-violet-200/75">Country Panel</div>
                <h3 className="font-display text-2xl text-white">{country.name}</h3>
              </div>
              <Badge tone={trendTone}>{forecast.trend}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MetricTile label="Total emissions" value={formatMt(country.totalEmissions)} tone="green" />
              <MetricTile label="Global rank" value={`#${country.rank}`} tone="sky" />
              <MetricTile label="Per capita" value={`${country.perCapita.toFixed(2)} tCO2e`} tone="orange" />
              <MetricTile label="Population" value={formatPopulation(country.population)} tone="violet" />
              <MetricTile label="GDP" value={formatGdp(country.gdp)} tone="default" />
              <MetricTile label="Forest coverage" value={formatPercent(country.forestCoverage)} tone="green" />
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#0a1323] p-4">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge tone="violet">R² {forecast.rSquared.toFixed(2)}</Badge>
                <Badge tone={trendTone}>
                  {forecast.trend} at {forecast.rate.toFixed(2)} MtCO2e/yr
                </Badge>
              </div>
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={forecastSeries}>
                    <defs>
                      <linearGradient id="forecastHistoryFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="year"
                      type="number"
                      domain={[2015, 2030]}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#08101c',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 16,
                      }}
                    />
                    <Area
                      dataKey="historical"
                      type="monotone"
                      stroke="#22C55E"
                      fill="url(#forecastHistoryFill)"
                      strokeWidth={2.6}
                    />
                    <Area dataKey="bandBase" stackId="band" stroke="none" fill="transparent" />
                    <Area
                      dataKey="bandSpread"
                      stackId="band"
                      type="monotone"
                      stroke="none"
                      fill="#A78BFA"
                      fillOpacity={0.18}
                    />
                    <Line
                      dataKey="forecast"
                      type="monotone"
                      stroke="#A78BFA"
                      strokeWidth={2.5}
                      strokeDasharray="6 6"
                      dot={{ r: 3, fill: '#A78BFA' }}
                    />
                    <ReferenceLine
                      x={2023.5}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      label={{ value: 'Now', fill: '#e2e8f0', position: 'top' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Link
              href={`/country/${country.code}/map`}
              className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/15"
            >
              Enter Map View
              <ArrowRight className="h-4 w-4" />
            </Link>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
