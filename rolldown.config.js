import {defineConfig} from 'rolldown';

export default defineConfig({
	experimental: {
		attachDebugInfo: 'none',
	},
	input: './src/index.ts',
	output: {
		file: './dist/magnus.full.js',
		minify: 'dce-only',
	},
});
