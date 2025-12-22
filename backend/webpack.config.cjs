const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const DefinePlugin = require('webpack').DefinePlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, options) => {
  const isDevelopment = options.mode === 'development';

  return {
    target: 'node',
    externalsPresets: { node: true },

    mode: options.mode,
    devtool: isDevelopment ? 'inline-source-map' : false,

    entry: {
      backend: path.resolve(__dirname, 'index.ts'),
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].cjs',
      libraryTarget: 'commonjs2',
      globalObject: 'this',
    },

    resolve: {
      extensions: ['.ts', '.js'],

      mainFields: ['main', 'module'],
      conditionNames: ['node', 'require', 'default'],

      alias: {
        // '@src': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'ts-loader',
            },
          ],
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            force: isDevelopment,
            from: path.resolve(__dirname, '.env'),
            to: '.',
          },
        ],
      }),

      new DefinePlugin({
        'process.env.__IS_CJS__': JSON.stringify(true),
        'process.env.NODE_ENV': JSON.stringify(options.mode),
      }),
    ],
    watch: false,
    watchOptions: {
      ignored: /node_modules/,
    },
    optimization: {
      minimize: !isDevelopment,
      sideEffects: false,
      usedExports: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            format: {
              comments: isDevelopment,
            },
            sourceMap: isDevelopment,
          },
        }),
      ],
    },
  };
};
