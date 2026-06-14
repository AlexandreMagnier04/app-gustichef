import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
	resolve: {
		alias: {
			$lib: resolve('./src/lib'),
			'$env/dynamic/private': resolve('./tests/mocks/env-private.ts')
		}
	},
	test: {
		include: ['tests/integration/**/*.test.ts'],
		environment: 'node',
		globals: true,
		pool: 'forks',
		fileParallelism: false,
		testTimeout: 10000
	}
});
