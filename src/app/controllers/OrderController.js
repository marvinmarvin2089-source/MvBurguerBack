import Stripe from 'stripe';
import 'dotenv/config';
import * as Yup from 'yup';
import Category from '../models/Category.js';
import Order from '../models/order.js';
import Product from '../models/Product.js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

class OrderContoller {
  async store(request, response) {
    const schema = Yup.object().shape({
      products: Yup.array()
        .required()
        .of(
          Yup.object().shape({
            id: Yup.number().integer().positive().required(),
            quantity: Yup.number().integer().positive().required(),
          }),
        ),
      paymentIntentId: Yup.string().required(),
    });

    try {
      await schema.validate(request.body, {
        abortEarly: false,
        strict: true,
      });
    } catch (err) {
      return response.status(400).json({ message: err.errors });
    }

    const { userId, userName } = request;
    const { products, paymentIntentId } = request.body;

    if (!stripe) {
      return response.status(500).json({ error: 'Pagamento não configurado' });
    }

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (_error) {
      return response.status(400).json({
        error: 'PaymentIntent inválido ou não encontrado',
      });
    }

    if (paymentIntent.metadata?.userId !== String(userId)) {
      return response.status(403).json({ error: 'Acesso negado' });
    }

    const paymentStatus =
      paymentIntent.status === 'succeeded'
        ? 'Aprovado'
        : paymentIntent.status === 'requires_payment_method'
          ? 'Falhou'
          : 'Pendente';

    const productIds = products.map((product) => product.id);

    const findedProducts = await Product.findAll({
      where: {
        id: productIds,
      },
      include: {
        model: Category,
        as: 'category',
        attributes: ['name'],
      },
    });

    if (findedProducts.length !== products.length) {
      return response.status(400).json({
        message: 'Um ou mais produtos não existem',
      });
    }

    const mapedProducts = findedProducts.map((product) => {
      const productFromRequest = products.find((p) => p.id === product.id);
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        url: product.url,
        category: product.category?.name ?? 'Sem categoria',
        quantity: productFromRequest.quantity ?? 0,
      };
    });

    const orderData = {
      user: {
        id: userId,
        name: userName,
      },
      products: mapedProducts,
      status: 'Pedido recebido',
      payment_status: paymentStatus,
      payment_intent_id: paymentIntentId,
    };

    try {
      const newOrder = await Order.create(orderData);

      return response.status(201).json(newOrder);
    } catch (err) {
      console.error('Erro ao criar pedido:', err.message);
      console.error('Detalhes:', err.original || err.parent);
      return response.status(500).json({ error: err.message });
    }
  }

  async update(request, response) {
    const schema = Yup.object().shape({
      status: Yup.string()
        .oneOf([
          'Pedido recebido',
          'Em preparação',
          'A caminho',
          'Entregue',
          'Cancelado',
        ])
        .required(),
    });

    try {
      await schema.validate(request.body, {
        abortEarly: false,
        strict: true,
      });
    } catch (err) {
      return response.status(400).json({ message: err.errors });
    }
    const { status } = request.body;
    const { id } = request.params;

    try {
      const [updatedCount] = await Order.update({ status }, { where: { id } });

      if (!updatedCount) {
        return response.status(404).json({ error: 'Pedido não encontrado' });
      }
    } catch (err) {
      return response.status(400).json({ error: err.message });
    }

    return response
      .status(200)
      .json({ message: 'Status do pedido atualizado com sucesso' });
  }

  async index(request, response) {
    const orders = await Order.findAll({
      where: request.userAdmin ? {} : undefined,
    });

    const visibleOrders = request.userAdmin
      ? orders
      : orders.filter((order) => order.user?.id === request.userId);

    return response.status(200).json(visibleOrders);
  }
}

export default new OrderContoller();
