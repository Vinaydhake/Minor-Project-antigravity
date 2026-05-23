import { AnimatePresence, motion } from 'motion/react';
import { Globe2, Leaf, Sparkles } from 'lucide-react';
import { Link, Route, Switch, useLocation } from 'wouter';
import { HomePage } from './pages/HomePage';
import { CountryPage } from './pages/CountryPage';
import { MapPage } from './pages/MapPage';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { cn } from './lib/format';

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-medium transition',
        active ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-200 hover:bg-white/10'
      )}
    >
      {label}
    </Link>
  );
}

function AnimatedRoutes() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <Switch>
          <Route path="/">
            <HomePage />
          </Route>
          <Route path="/analyzer">
            <AnalyzerPage />
          </Route>
          <Route path="/country/:code/map">
            {(params) => <MapPage code={params.code.toUpperCase()} />}
          </Route>
          <Route path="/country/:code">
            {(params) => <CountryPage code={params.code.toUpperCase()} />}
          </Route>
          <Route>
            <NotFoundPage />
          </Route>
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [location] = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.14),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#0b0f19]/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-2 text-sky-100">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold text-white">EarthPulse</div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Global GHG Explorer</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5">
            <NavLink href="/" label="Explore" active={location === '/' || location.startsWith('/country/')} />
            <NavLink href="/analyzer" label="Analyzer" active={location === '/analyzer'} />
          </nav>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 lg:flex">
            <Sparkles className="h-4 w-4 text-violet-200" />
            OLS forecast + glass dashboards
          </div>
        </div>
      </header>

      <main className="scrollbar-panel relative z-10 mx-auto max-w-[1440px] px-4 py-8 md:px-6 md:py-10">
        <AnimatedRoutes />
      </main>

      <footer className="relative z-10 mx-auto max-w-[1440px] px-4 pb-10 pt-2 text-sm text-slate-500 md:px-6">
        <div className="rounded-[26px] border border-white/8 bg-white/[0.03] px-5 py-4">
          Synthetic climate exploration dataset for interface prototyping. Personal analyzer uses transparent rule-based calculations with IPCC, DEFRA, and EPA-style factors.
          <span className="ml-2 inline-flex items-center gap-1 text-green-200">
            <Leaf className="h-4 w-4" />
            Dark glass design system
          </span>
        </div>
      </footer>
    </div>
  );
}
