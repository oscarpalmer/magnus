/// <reference types="vitest" />
import {extname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {globSync} from 'glob';
import {defineConfig} from 'vite';

const watch = process.argv.includes('--watch');

const files = globSync(watch ? './src/index.ts' : './src/**/*.ts').map(file => [
	relative('./src', file.slice(0, file.length - extname(file).length)),
	fileURLToPath(new URL(file, import.meta.url)),
]);

export default defineConfig({
	base: './',
	build: {
		lib: {
			entry: [],
			formats: watch ? ['es'] : ['cjs', 'es'],
		},
		minify: false,
		outDir: './dist',
		rollupOptions: {
			external: watch
				? []
				: [
						'@oscarpalmer/atoms/is',
						'@oscarpalmer/atoms/function',
						'@oscarpalmer/atoms/string',
						'@oscarpalmer/toretto/event',
						'@oscarpalmer/toretto/find',
					],
			input: Object.fromEntries(files),
			output: {
				generatedCode: 'es2015',
				preserveModules: !watch,
			},
		},
	},
	logLevel: 'silent',
	test: {
		coverage: {
			include: ['src/**/*.ts'],
			provider: 'istanbul',
		},
		environment: 'jsdom',
		watch: watch,
	},
});
