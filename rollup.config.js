import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

const header = [
  '/*!',
  ` * Magnus, v${pkg.version}`,
  ' * https://github.com/oscarpalmer/magnus',
  ' * (c) Oscar Palmér, 2021, MIT @license',
  ' */',
];

module.exports = {
  input: './src/index.ts',
  output: {
    banner: header.join('\n'),
    file: './dist/magnus.js',
    format: 'iife',
    name: 'Magnus',
  },
  plugins: [typescript()],
  watch: {
    include: 'src/**',
  },
};
