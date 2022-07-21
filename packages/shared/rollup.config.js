import NodePath from 'path';
import RollupNodeResolve from '@rollup/plugin-node-resolve';
import RollupCommonjs from '@rollup/plugin-commonjs';
import RollupTypescript from 'rollup-plugin-typescript2';
import Package from './package.json';
import cleanup from "rollup-plugin-cleanup";
import {terser} from "rollup-plugin-terser";

const resolveFile = (path) => NodePath.resolve(__dirname, path);

export default {
  input: resolveFile(Package.source),
  output: [
    {
      file: resolveFile(Package.main),
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: resolveFile(Package.module),
      format: 'es',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: resolveFile(Package.browser),
      format: 'umd',
      name: '@poster-render/shared',
      sourcemap: true,
      exports: 'named',
    },
  ],
  plugins: [
    RollupNodeResolve({
      moduleDirectories: ['node_modules']
    }),
    RollupCommonjs({
      include: /\/node_modules\//,
    }),
    RollupTypescript({
      tsconfig: resolveFile('tsconfig.rollup.json'),
    }),
    cleanup(),
    terser(),
  ],
};