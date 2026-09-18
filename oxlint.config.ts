import {defineConfig} from 'oxlint';
import rules from './node_modules/@oscarpalmer/atoms/plugin/rules.js';

export default defineConfig({
	jsPlugins: ['./node_modules/@oscarpalmer/atoms/plugin/index.js'],
	rules: {
		...rules,
	},
});
