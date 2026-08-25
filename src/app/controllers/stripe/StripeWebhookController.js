import Stripe from 'stripe';
import 'dotenv/config';
import Order from '../../models/order.js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

class StripeWebhookController {
  async store(request, response) {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe webhook não configurado:', {
        stripeConfigured: Boolean(stripe),
        webhookSecretConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      });
      return response.status(500).json({ error: 'Webhook não configurado' });
    }

    const signature = request.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (_error) {
      return response
        .status(400)
        .json({ error: 'Assinatura do webhook inválida' });
    }

    try {
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        await Order.update(
          { status: 'Pagamento aprovado' },
          { where: { payment_intent_id: paymentIntent.id } },
        );
      }

      if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        await Order.update(
          { status: 'Pagamento falhou' },
          { where: { payment_intent_id: paymentIntent.id } },
        );
      }
    } catch (error) {
      console.error('Erro ao processar webhook Stripe:', error.message);
      return response.status(500).json({ error: 'Erro ao processar webhook' });
    }

    return response.json({ received: true });
  }
}

export default new StripeWebhookController();
