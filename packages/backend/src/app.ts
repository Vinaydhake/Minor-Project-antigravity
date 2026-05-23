import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { logger } from './logger.js';
import countriesRouter from './routes/countries.js';
import statesRouter from './routes/states.js';
import citiesRouter from './routes/cities.js';
import forecastRouter from './routes/forecast.js';
import analyzerRouter from './routes/analyzer.js';
import countryCitiesRouter from './routes/country-cities.js';

const app = express();

// Midlewares
app.use(cors());
app.use(express.json());

// Pino HTTP request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === '/health',
    },
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/countries', countriesRouter);
app.use('/api/countries', statesRouter);
app.use('/api/states', citiesRouter);
app.use('/api/countries', forecastRouter);
app.use('/api/countries', countryCitiesRouter);
app.use('/api/analyzer', analyzerRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.originalUrl}' not found` });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err, 'Global unhandled error occurred');
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

export default app;
