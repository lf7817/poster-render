import NodePath from 'path';
import RollupNodeResolve from '@rollup/plugin-node-resolve';
import RollupCommonjs from '@rollup/plugin-commonjs';
import RollupTypescript from 'rollup-plugin-typescript2';
import Package from './package.json';
import cleanup from "rollup-plugin-cleanup";
import {terser} from "rollup-plugin-terser";

const externalPackages = [
  '@tarojs/taro',
];
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
      name: 'taro-free-poster',
      sourcemap: true,
      exports: 'named',
      globals: {
        '@tarojs/taro': 'Taro',
      },
    },
  ],
  external: externalPackages,
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