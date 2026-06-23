import { spawn, spawnSync, type ChildProcess } from 'child_process';

let server: ChildProcess;
const PORT = 4173;

// Tue tout processus qui occupe le port
function freePort(port: number) {
	if (process.platform === 'win32') {
		try {
			const netstat = spawnSync('netstat', ['-aon'], { encoding: 'utf8' });
			const lines = netstat.stdout?.split('\n') ?? [];
			for (const line of lines) {
				if (line.includes(`:${port} `) || line.includes(`:${port}\t`)) {
					const parts = line.trim().split(/\s+/);
					const procId = parts[parts.length - 1];
					if (/^\d+$/.test(procId) && procId !== '0') {
						spawnSync('taskkill', ['/F', '/PID', procId], { stdio: 'pipe' });
					}
				}
			}
		} catch {
			// Port probablement libre
		}
	} else {
		try {
			spawnSync('fuser', ['-k', `${port}/tcp`], { stdio: 'pipe' });
		} catch {
			// Port probablement libre
		}
	}
}

// Attend que le serveur HTTP réponde (polling fetch)
async function waitForPort(port: number, timeoutMs: number): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (true) {
		try {
			await fetch(`http://localhost:${port}`, { signal: AbortSignal.timeout(1000) });
			return;
		} catch {
			if (Date.now() >= deadline) {
				throw new Error(`Serveur E2E inaccessible sur port ${port} après ${timeoutMs}ms`);
			}
			await new Promise((r) => setTimeout(r, 300));
		}
	}
}

// Libère le port puis démarre `pnpm preview` (le build doit déjà être fait)
export async function setup() {
	freePort(PORT);
	await new Promise((r) => setTimeout(r, 500));

	server = spawn('pnpm', ['preview', '--', '--port', String(PORT), '--strictPort'], {
		env: { ...process.env },
		stdio: 'inherit',
		shell: true
	});

	server.on('error', (err) => {
		throw err;
	});

	await waitForPort(PORT, 20000);
}

export async function teardown() {
	if (server) {
		if (process.platform === 'win32' && server.pid) {
			spawnSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'pipe' });
		} else {
			server.kill('SIGTERM');
		}
	}
	await new Promise((r) => setTimeout(r, 500));
}
