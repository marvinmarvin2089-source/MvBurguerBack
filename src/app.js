import cors from 'cors';
import express from 'express';
import StripeWebhookController from './app/controllers/stripe/StripeWebhookController.js';
import fileRoutesConfig from './config/fileRoutes.cjs';
import routes from './routes.js';

const app = express();

app.use(cors());
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
