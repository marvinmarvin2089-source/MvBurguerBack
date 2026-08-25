// libs externas
import { Router } from 'express';
import multer from 'multer';
// controllers
import CategoryController from './app/controllers/CategoryController.js';
import OrderController from './app/controllers/OrderController.js';
import ProductController from './app/controllers/ProductController.js';
import SessionController from './app/controllers/SessionController.js';
import CreatePaymentIntentController from './app/controllers/stripe/CreatePaymentIntentController.js';
import UserController from './app/controllers/UserController.js';
// middlewares
import adminMiddleware from './app/middlewares/admin.js';
import authMiddleware from './app/middlewares/auth.js';
import Category from './app/models/Category.js';

// models
import Product from './app/models/Product.js';
// configs
import multerConfig from './config/multer.cjs';

const routes = new Router();

const upload = multer(multerConfig);
// públicas
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// protegidas, será chamada por todas as rotas abaixo, ela pede o token.
routes.use(authMiddleware);

// produtos
routes.post(
  '/products',
  adminMiddleware,
  upload.single('file'),
  ProductController.store,
);

routes.put(
  '/products/:id',
  adminMiddleware,
  upload.single('file'),
  ProductController.update,
);
routes.get('/products', ProductController.index);

// categorias
routes.post(
  '/categories',
  adminMiddleware,
  upload.single('file'),
  CategoryController.store,
);
routes.put(
  '/categories/:id',
  adminMiddleware,
  upload.single('file'),
  CategoryController.update,
);
routes.get('/categories', CategoryController.index);

// pedidos
routes.post('/orders', OrderController.store);
routes.get('/orders', OrderController.index);
routes.put('/orders/:id', adminMiddleware, OrderController.update);

routes.post('/create-payment-intent', CreatePaymentIntentController.store);
routes.get('/payments/:paymentIntentId', CreatePaymentIntentController.show);

// DELETE TODOS PRODUTOS
routes.delete('/products', adminMiddleware, async (_req, res) => {
  await Product.destroy({ where: {} });
  res.json({ message: 'Produtos deletados' });
});

// DELETE TODAS CATEGORIAS
routes.delete('/categories', adminMiddleware, async (_req, res) => {
  await Category.destroy({ where: {} });
  res.json({ message: 'Categorias deletadas' });
});

export default routes;
