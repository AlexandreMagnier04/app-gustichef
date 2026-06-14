import type { RequestHandler } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { subscribe, userChannel } from '$lib/server/db/pubsub';

export const GET: RequestHandler = async ({ locals }) => {
	const user = requireUser(locals);
	const channel = userChannel(user.id);

	let unsub: (() => Promise<void>) | null = null;
	let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
	const encoder = new TextEncoder();

	const stream = new ReadableStream<Uint8Array>({
		async start(ctrl) {
			controller = ctrl;
			ctrl.enqueue(encoder.encode('data: {"type":"connected"}\n\n'));

			unsub = await subscribe(channel, (payload) => {
				try {
					controller?.enqueue(encoder.encode(`data: ${payload}\n\n`));
				} catch {
					// stream closed
				}
			});
		},
		cancel() {
			unsub?.();
			controller = null;
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no'
		}
	});
};
