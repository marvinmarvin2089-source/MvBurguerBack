import Stripe from 'stripe';
import * as Yup from 'yup';
import 'dotenv/config';
import Product from '../../models/Product.js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
const DELIVERY_FEE_CENTS = 500;

class CreatePaymentIntentController {
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
    });

    try {
      await schema.validate(request.body, {
        abortEarly: false,
        strict: true,
      });
    } catch (err) {
      return response.status(400).json({ message: err.errors });
    }

    if (!stripe) {
      return response.status(500).json({ error: 'Pagamento não configurado' });
    }

    const { products } = request.body;
    const productIds = products.map((product) => product.id);
    const storedProducts = await Product.findAll({ where: { id: productIds } });

    if (storedProducts.length !== productIds.length) {
      return response
        .status(400)
        .json({ error: 'Um ou mais produtos não existem' });
    }

    const totalInCents = products.reduce((total, item) => {
      const product = storedProducts.find(({ id }) => id === item.id);
      return total + product.price * item.quantity;
    }, 0);
    const amount = totalInCents + DELIVERY_FEE_CENTS;

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'brl',
        metadata: { userId: request.userId },
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } catch (error) {
      console.error('Stripe PaymentIntent error:', {
        type: error.type,
        code: error.code,
        message: error.message,
      });
      return response.status(502).json({
        error: 'Não foi possível iniciar o pagamento',
        details:
          process.env.NODE_ENV === 'production' ? undefined : error.message,
      });
    }

    response.json({
      clientSecret: paymentIntent.client_secret,
      dpmCheckerLink: 'https://dashboard.stripe.com/test/dpm_checker',
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
    });
  }

  async show(request, response) {
    if (!stripe) {
      return response.status(500).json({ error: 'Pagamento não configurado' });
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        request.params.paymentIntentId,
      );
      const isOwner = paymentIntent.metadata?.userId === request.userId;

      if (!isOwner && !request.userAdmin) {
        return response.status(403).json({ error: 'Acesso negado' });
      }

      return response.json({
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      });
    } catch (_error) {
      return response.status(404).json({ error: 'Pagamento não encontrado' });
    }
  }
}

export default new CreatePaymentIntentController();
