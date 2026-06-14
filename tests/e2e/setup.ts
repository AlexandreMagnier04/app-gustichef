import { spawn, type ChildProcess } from 'child_process';

let server: ChildProcess;

// Démarre `pnpm preview` et attend que le port 4173 soit prêt
// Requiert que `pnpm build` ait été exécuté avant
export async function setup() {
	server = spawn('pnpm', ['preview'], {
		env: { ...process.env },
		stdio: 'pipe',
		shell: true
	});

	await new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(
			() =>
				reject(
					new Error(
						"Timeout : le serveur E2E n'a pas démarré en 30s. Avez-vous exécuté pnpm build ?"
					)
				),
			30000
		);

		server.stdout?.on('data', async (chunk: Buffer) => {
			const output = chunk.toString();
			if (output.includes('4173') || output.includes('localhost')) {
				await new Promise((r) => setTimeout(r, 600));
				clearTimeout(timeout);
				resolve();
			}
		});

		server.stderr?.on('data', async (chunk: Buffer) => {
			const output = chunk.toString();
			if (output.includes('4173') || output.includes('localhost')) {
				await new Promise((r) => setTimeout(r, 600));
				clearTimeout(timeout);
				resolve();
			}
		});

		server.on('error', (err) => {
			clearTimeout(timeout);
			reject(err);
		});
	});
}

export async function teardown() {
	server?.kill('SIGTERM');
	await new Promise((r) => setTimeout(r, 500));
}
