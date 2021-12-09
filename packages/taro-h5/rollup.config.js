import { mergeWith } from 'lodash'
import { join } from 'path'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import common from 'rollup-plugin-commonjs'
import alias from 'rollup-plugin-alias'
import postcss from 'rollup-plugin-postcss'
import exportNameOnly from './build/rollup-plugin-export-name-only'

const babel = require('@rollup/plugin-babel').default

const cwd = __dirname
const baseConfig = {
  external: ['nervjs', '@tarojs/runtime', 'react-dom'],
  output: {
    format: 'cjs',
    sourcemap: false,
    exports: 'auto'
  },
  plugins: [
    alias({
      '@tarojs/taro': join(cwd, '../taro/src/index')
    }),
    resolve({
      preferBuiltins: false,
      mainFields: ['module', 'js-next', 'main']
    }),
    postcss(),
    babel({
      babelrc: false,
      presets: [
        ['@babel/preset-env', {
          modules: false
        }]
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread',
        ['@babel/plugin-transform-react-jsx', {
          pragma: 'Nerv.createElement'
        }]
      ]
    }),
    common(),
    typescript({
      useTsconfigDeclarationDir: true
    })
  ]
}

const variesConfig = [{
  input: 'src/api/index.ts',
  output: {
    file: 'dist/taroApis.js'
  },
  plugins: exportNameOnly()
}, {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.cjs.js'
  }
}, {
  input: 'src/index.ts',
  output: {
    format: 'es',
    file: 'dist/index.js'
  }
}]

export default variesConfig.map(v => {
  const customizer = function (objValue, srcValue) {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue)
    }
    if (typeof objValue === 'object') {
      return mergeWith({}, objValue, srcValue, customizer)
    }
  }
  return mergeWith({}, baseConfig, v, customizer)
})
