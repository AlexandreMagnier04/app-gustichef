import { json, error } from '@sveltejs/kit';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { requireUser } from '$lib/server/services/auth';

export const POST = async ({ request, locals }) => {
	const user = requireUser(locals);
	if (user.role === 'chief') throw error(403, 'Réservé aux clients');

	const { amount } = await request.json();
	if (!amount || amount < 50) throw error(400, 'Montant invalide');

	const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? '');
	const paymentIntent = await stripe.paymentIntents.create({
		amount: Math.round(amount),
		currency: 'eur',
		automatic_payment_methods: { enabled: true },
		metadata: { userId: user.id }
	});

	return json({ clientSecret: paymentIntent.client_secret });
};
