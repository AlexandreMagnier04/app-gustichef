import { json, error } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import { requireUser } from '$lib/server/services/auth';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const POST = async ({ locals }) => {
	const user = requireUser(locals);
	if (user.role === 'chief') throw error(403, 'Réservé aux clients');

	const setupIntent = await stripe.setupIntents.create({
		automatic_payment_methods: { enabled: true },
		usage: 'off_session',
		metadata: { userId: user.id }
	});

	return json({ clientSecret: setupIntent.client_secret });
};
