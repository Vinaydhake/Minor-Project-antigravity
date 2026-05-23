import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.cjs',
  minify: true,
  sourcemap: true,
  format: 'cjs',
  // Mark native binary libraries as external so esbuild doesn't try to bundle them
  external: ['better-sqlite3', 'pino', 'pino-http'],
}).catch(() => process.exit(1));
