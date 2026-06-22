import { spawn, execSync, type ChildProcess } from 'child_process';

let server: ChildProcess;

// Tue le processus sur le port 4173 (Windows + Unix)
function killPort(port: number) {
	try {
		if (process.platform === 'win32') {
			const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
			const pids = [...new Set(result.trim().split('\n').map((l) => l.trim().split(/\s+/).pop()).filter(Boolean))];
			for (const pid of pids) {
				try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' }); } catch {}
			}
		} else {
			execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
		}
	} catch {}
}

// Démarre `pnpm preview` et attend que le port 4173 soit prêt
// Requiert que `pnpm build` ait été exécuté avant
export async function setup() {
	// S'assurer que le port est libre avant de démarrer
	killPort(4173);
	await new Promise((r) => setTimeout(r, 500));

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

		// Si le process exit immédiatement → port déjà pris ou build manquant
		server.on('exit', (code) => {
			if (code !== 0 && code !== null) {
				clearTimeout(timeout);
				reject(new Error(`pnpm preview a quitté avec le code ${code}. Vérifiez que pnpm build a été exécuté.`));
			}
		});
	});
}

export async function teardown() {
	if (server) {
		if (process.platform === 'win32') {
			// Sur Windows, SIGTERM est ignoré — on tue l'arbre de processus
			try { execSync(`taskkill /F /T /PID ${server.pid}`, { stdio: 'ignore' }); } catch {}
		} else {
			server.kill('SIGTERM');
		}
	}
	// Tuer proprement le port au cas où un enfant survit
	await new Promise((r) => setTimeout(r, 300));
	killPort(4173);
}
