import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Leaf, Target, Zap } from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchAnalyzerFactors } from '../lib/api';
import { calculateAnalyzerResult, getCountryLabel } from '../lib/emissions';
import { cn, formatKg, formatTonnesFromKg } from '../lib/format';
import { ErrorState, GlassCard, LoadingState, SectionTitle } from '../components/ui';
import type { AnalyzerInput } from '../types';

const DEFAULT_INPUTS: AnalyzerInput = {
  familyMembers: 4,
  country: 'IND',
  electricityKwh: 240,
  acHoursPerDay: 5,
  carKmPerWeek: 120,
  bikeKmPerWeek: 12,
  publicTransportKmPerWeek: 40,
  flightsPerYear: 2,
  avgFlightDistance: 1200,
  dietType: 'medium-meat',
  recyclingHabit: 'some',
  composting: false,
  plasticUsage: 'medium',
  reductionGoal: 18,
};

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium text-white">{label}</div>
        <div className="text-sm text-sky-200">
          {value} {unit}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-sky-400"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="rounded-[26px] border border-white/10 bg-white/5 p-4">
      <div className="font-medium text-white">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-4 w-full rounded-2xl border border-white/10 bg-[#0b1322] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AnalyzerPage() {
  const [inputs, setInputs] = useState<AnalyzerInput>(DEFAULT_INPUTS);
  const deferredInputs = useDeferredValue(inputs);

  const factorsQuery = useQuery({
    queryKey: ['analyzer-factors'],
    queryFn: fetchAnalyzerFactors,
  });

  if (factorsQuery.isLoading) {
    return <LoadingState label="Loading emissions factors for the personal analyzer..." />;
  }

  if (factorsQuery.isError || !factorsQuery.data) {
    return (
      <ErrorState
        title="Analyzer unavailable"
        description="The emissions factor dataset did not load, so personal footprint analysis can’t be calculated."
      />
    );
  }

  const result = calculateAnalyzerResult(deferredInputs, factorsQuery.data);
  const radialValue = Math.min(result.ratioToAverage, 200);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Personal Emissions Analyzer"
        title="Understand the household footprint behind the global view"
        description="Adjust energy, transport, flights, food, and waste inputs to see a live household estimate with reduction goals and ranked action ideas."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="space-y-5">
          <GlassCard className="grid gap-4 md:grid-cols-2">
            <SliderField
              label="Family members"
              value={inputs.familyMembers}
              min={1}
              max={8}
              unit="people"
              onChange={(value) => setInputs((current) => ({ ...current, familyMembers: value }))}
            />
            <SelectField
              label="Country grid context"
              value={inputs.country}
              onChange={(value) =>
                setInputs((current) => ({ ...current, country: value as AnalyzerInput['country'] }))
              }
              options={[
                { label: 'India', value: 'IND' },
                { label: 'United States', value: 'USA' },
                { label: 'European Union', value: 'EU' },
                { label: 'China', value: 'CHN' },
                { label: 'Global average', value: 'GLOBAL' },
              ]}
            />
            <SliderField
              label="Monthly electricity"
              value={inputs.electricityKwh}
              min={40}
              max={1200}
              step={10}
              unit="kWh"
              onChange={(value) => setInputs((current) => ({ ...current, electricityKwh: value }))}
            />
            <SliderField
              label="AC hours per day"
              value={inputs.acHoursPerDay}
              min={0}
              max={16}
              unit="hrs"
              onChange={(value) => setInputs((current) => ({ ...current, acHoursPerDay: value }))}
            />
            <SliderField
              label="Car travel"
              value={inputs.carKmPerWeek}
              min={0}
              max={600}
              step={10}
              unit="km/week"
              onChange={(value) => setInputs((current) => ({ ...current, carKmPerWeek: value }))}
            />
            <SliderField
              label="Bike travel"
              value={inputs.bikeKmPerWeek}
              min={0}
              max={160}
              step={5}
              unit="km/week"
              onChange={(value) => setInputs((current) => ({ ...current, bikeKmPerWeek: value }))}
            />
            <SliderField
              label="Public transport"
              value={inputs.publicTransportKmPerWeek}
              min={0}
              max={500}
              step={10}
              unit="km/week"
              onChange={(value) =>
                setInputs((current) => ({ ...current, publicTransportKmPerWeek: value }))
              }
            />
            <SliderField
              label="Flights per year"
              value={inputs.flightsPerYear}
              min={0}
              max={20}
              unit="flights"
              onChange={(value) => setInputs((current) => ({ ...current, flightsPerYear: value }))}
            />
            <SliderField
              label="Average flight distance"
              value={inputs.avgFlightDistance}
              min={200}
              max={12000}
              step={100}
              unit="km"
              onChange={(value) => setInputs((current) => ({ ...current, avgFlightDistance: value }))}
            />
            <SelectField
              label="Diet type"
              value={inputs.dietType}
              onChange={(value) =>
                setInputs((current) => ({ ...current, dietType: value as AnalyzerInput['dietType'] }))
              }
              options={[
                { label: 'Vegan', value: 'vegan' },
                { label: 'Vegetarian', value: 'vegetarian' },
                { label: 'Low meat', value: 'low-meat' },
                { label: 'Medium meat', value: 'medium-meat' },
                { label: 'High meat', value: 'high-meat' },
              ]}
            />
            <SelectField
              label="Recycling habit"
              value={inputs.recyclingHabit}
              onChange={(value) =>
                setInputs((current) => ({
                  ...current,
                  recyclingHabit: value as AnalyzerInput['recyclingHabit'],
                }))
              }
              options={[
                { label: 'None', value: 'none' },
                { label: 'Some', value: 'some' },
                { label: 'Heavy', value: 'heavy' },
              ]}
            />
            <SelectField
              label="Plastic usage"
              value={inputs.plasticUsage}
              onChange={(value) =>
                setInputs((current) => ({ ...current, plasticUsage: value as AnalyzerInput['plasticUsage'] }))
              }
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
              ]}
            />
            <label className="rounded-[26px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-white">Composting</div>
                  <div className="mt-1 text-sm text-slate-400">Reduce methane-heavy wet waste</div>
                </div>
                <button
                  type="button"
                  onClick={() => setInputs((current) => ({ ...current, composting: !current.composting }))}
                  className={cn(
                    'relative inline-flex h-8 w-14 items-center rounded-full border transition',
                    inputs.composting
                      ? 'border-green-400/30 bg-green-500/20'
                      : 'border-white/10 bg-white/10'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-6 w-6 rounded-full bg-white shadow transition',
                      inputs.composting ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </label>
          </GlassCard>
        </div>

        <div className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <GlassCard className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-sky-200/75">Results</div>
                <h3 className="font-display text-3xl text-white">{result.totalTonnes.toFixed(2)} tCO2e / year</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Compared against the {getCountryLabel(inputs.country)} per-person baseline scaled to your household size.
                </p>
              </div>
              <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-3 text-sky-200">
                <Zap className="h-5 w-5" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Current total</div>
                <div className="mt-2 text-2xl font-semibold text-white">{formatKg(result.totalKg)}</div>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">National comparison</div>
                <div className="mt-2 text-2xl font-semibold text-white">{result.ratioToAverage.toFixed(0)}%</div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#0a1323] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Pie breakdown</div>
                  <div className="font-display text-xl text-white">Category mix</div>
                </div>
                <Leaf className="h-5 w-5 text-green-200" />
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={result.breakdown}
                      dataKey="kg"
                      nameKey="label"
                      innerRadius={55}
                      outerRadius={88}
                      paddingAngle={3}
                    >
                      {result.breakdown.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatKg(value)}
                      contentStyle={{
                        background: '#08101c',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 16,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#0a1323] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Radial comparison</div>
                  <div className="font-display text-xl text-white">Vs national average</div>
                </div>
                <Target className="h-5 w-5 text-violet-200" />
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      data={[{ name: 'Footprint', value: radialValue, fill: '#A78BFA' }]}
                    startAngle={180}
                    endAngle={0}
                    innerRadius="55%"
                    outerRadius="90%"
                    >
                      <PolarAngleAxis type="number" domain={[0, 200]} tick={false} />
                      <RadialBar background dataKey="value" cornerRadius={18} />
                      <text x="50%" y="48%" textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="700">
                        {result.ratioToAverage.toFixed(0)}%
                      </text>
                      <text x="50%" y="60%" textAnchor="middle" fill="#94a3b8" fontSize="11">
                        of household baseline
                      </text>
                    </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#0a1323] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Category bars</div>
                  <div className="font-display text-xl text-white">Where the footprint lives</div>
                </div>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.breakdown}>
                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value: number) => formatKg(value)}
                      contentStyle={{
                        background: '#08101c',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 16,
                      }}
                    />
                    <Bar dataKey="kg" radius={[12, 12, 0, 0]}>
                      {result.breakdown.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-green-200/75">Reduction goal</div>
                <h3 className="font-display text-xl text-white">Target a lower annual footprint</h3>
              </div>
              <span className="rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1 text-sm text-green-200">
                {inputs.reductionGoal}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={inputs.reductionGoal}
              onChange={(event) =>
                setInputs((current) => ({ ...current, reductionGoal: Number(event.target.value) }))
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-green-400"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Baseline</div>
                <div className="mt-2 text-xl font-semibold text-white">{formatTonnesFromKg(result.totalKg)}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Target</div>
                <div className="mt-2 text-xl font-semibold text-white">{formatTonnesFromKg(result.targetKg)}</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-violet-200/75">AI recommendations</div>
                <h3 className="font-display text-xl text-white">Ranked by potential savings</h3>
              </div>
              <CheckCircle2 className="h-5 w-5 text-violet-200" />
            </div>
            <div className="space-y-3">
              {result.recommendations.map((recommendation) => (
                <div key={recommendation.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-white">{recommendation.title}</div>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]',
                        recommendation.difficulty === 'low'
                          ? 'bg-green-500/10 text-green-200'
                          : recommendation.difficulty === 'medium'
                            ? 'bg-orange-500/10 text-orange-200'
                            : 'bg-red-500/10 text-red-200'
                      )}
                    >
                      {recommendation.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{recommendation.description}</p>
                  <div className="mt-3 text-sm font-medium text-sky-200">
                    Save about {formatTonnesFromKg(recommendation.savingsKg)} annually
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
