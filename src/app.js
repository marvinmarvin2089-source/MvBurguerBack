import cors from 'cors';
import express from 'express';
import fileRoutesConfig from './config/fileRoutes.cjs';
import routes from './routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/products-files', fileRoutesConfig);
app.use('/category-files', fileRoutesConfig);

app.use(routes);

export default app;
