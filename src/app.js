import cors from 'cors';
import express from 'express';
import StripeWebhookController from './app/controllers/stripe/StripeWebhookController.js';
import fileRoutesConfig from './config/fileRoutes.cjs';
import routes from './routes.js';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origem não permitida pelo CORS'));
    },
  }),
);
app.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  StripeWebhookController.store,
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/products-files', fileRoutesConfig);
app.use('/category-files', fileRoutesConfig);

app.use(routes);

export default app;
