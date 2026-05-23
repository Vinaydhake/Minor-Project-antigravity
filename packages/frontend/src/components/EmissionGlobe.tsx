import Globe, { type GlobeMethods } from 'react-globe.gl';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import type { CountrySummary } from '../types';
import { getEmissionIntensityColor } from '../lib/emissions';
import { GlassCard } from './ui';

function supportsWebGl() {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
}

export function EmissionGlobe({ countries }: { countries: CountrySummary[] }) {
  const [, setLocation] = useLocation();
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webGlReady, setWebGlReady] = useState(false);
  const [globeWidth, setGlobeWidth] = useState(920);

  useEffect(() => {
    setWebGlReady(supportsWebGl());
  }, []);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const nextWidth = Math.max(320, Math.floor(entries[0].contentRect.width));
      setGlobeWidth(nextWidth);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!webGlReady || !globeRef.current) return;
    globeRef.current.pointOfView({ lat: 20, lng: 18, altitude: 2.1 }, 1200);
  }, [webGlReady]);

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enablePan = false;
    controls.minDistance = 180;
    controls.maxDistance = 320;
  }, [webGlReady]);

  if (!webGlReady) {
    return (
      <GlassCard className="flex min-h-[540px] items-center justify-center">
        <div className="max-w-md text-center">
          <h3 className="font-display text-2xl text-white">WebGL unavailable</h3>
          <p className="mt-3 text-sm text-slate-300">
            Your browser or GPU context isn&apos;t exposing WebGL right now, so the live globe can&apos;t render. The rest of the explorer still works, including country analytics and map drill-downs.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="relative overflow-hidden p-0">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-6">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-sky-200/80">Globe View</div>
          <h3 className="font-display text-2xl text-white">Global emissions in motion</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-slate-950/45 px-4 py-2 text-xs text-slate-300">
          Click any country point to inspect its profile
        </div>
      </div>
      <div ref={containerRef} className="h-[600px]">
        <Globe
          ref={globeRef}
          width={globeWidth}
          height={600}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          showAtmosphere
          atmosphereColor="#38BDF8"
          atmosphereAltitude={0.16}
          pointAltitude={0}
          pointRadius={(d) => {
            const emissions = (d as CountrySummary).totalEmissions;
            if (emissions > 1000) return 0.62;
            if (emissions > 200) return 0.52;
            if (emissions > 50) return 0.42;
            return 0.34;
          }}
          pointResolution={14}
          pointsData={countries}
          pointLat="lat"
          pointLng="lng"
          pointColor={(d) => getEmissionIntensityColor((d as CountrySummary).totalEmissions)}
          pointLabel={(d) => {
            const country = d as CountrySummary;
            return `
              <div style="padding:10px 12px;border-radius:16px;background:rgba(11,15,25,.92);border:1px solid rgba(255,255,255,.08);font-family:Inter,sans-serif;">
                <div style="font-weight:700;color:white;">${country.name}</div>
                <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">${country.totalEmissions.toFixed(1)} MtCO2e • Rank #${country.rank}</div>
              </div>
            `;
          }}
          onPointClick={(point) => {
            const country = point as CountrySummary;
            setLocation(`/country/${country.code}`);
          }}
        />
      </div>
    </GlassCard>
  );
}
