import express from 'express';
import routes from './routes.js';
import fileRoutesConfig from './config/fileRoutes.cjs';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/products-files', fileRoutesConfig);
app.use('/category-files', fileRoutesConfig);

app.use(routes);

export default app;
