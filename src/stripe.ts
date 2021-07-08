import Stripe from 'stripe';

const secret = process.env.STRIPE_SECRET!;
export const stripe = new Stripe(secret, {
  apiVersion: '2020-08-27',
});
