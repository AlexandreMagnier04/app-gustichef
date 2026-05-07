import { auth } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = (event) => auth.handler(event.request);
export const POST: RequestHandler = (event) => auth.handler(event.request);
