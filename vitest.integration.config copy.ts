import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
	resolve: { alias: { $lib: resolve('./src/lib') } },
	test: {
		include: ['tests/integration/**/*.test.ts'],
		environment: 'node',
		globals: true,
		pool: 'forks',
		testTimeout: 10000
	}
});
