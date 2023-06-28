import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';


export default {
  input: 'index.js',
  output: {
    file: 'build/bundle.js',
    format: 'cjs'
  },
  plugins: [nodeResolve(),commonjs(),terser()]
};