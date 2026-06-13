import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
	test: {
		include: ['tests/e2e/**/*.test.ts'],
		environment: 'node',
		globals: true,
		pool: 'forks',
		fileParallelism: false,
		testTimeout: 30000,
		globalSetup: './tests/e2e/setup.ts',
	},
});
