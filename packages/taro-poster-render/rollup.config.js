import NodePath from 'path';
import RollupNodeResolve from '@rollup/plugin-node-resolve';
import RollupCommonjs from '@rollup/plugin-commonjs';
import RollupTypescript from 'rollup-plugin-typescript2';
import Package from './package.json';
import {terser} from "rollup-plugin-terser";

const externalPackages = [
  'react',
  'react-dom',
  '@tarojs/components',
  '@tarojs/taro',
];
const resolveFile = (path) => NodePath.resolve(__dirname, path);

export default {
  input: resolveFile(Package.source),
  output: [
    {
      file: resolveFile(Package.main),
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: resolveFile(Package.module),
      format: 'es',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: resolveFile(Package.browser),
      format: 'umd',
      name: 'taro-poster-render',
      sourcemap: true,
      exports: 'named',
      globals: {
        react: 'React',
        '@tarojs/components': 'components',
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
    terser(),
  ],
};