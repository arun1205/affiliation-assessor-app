// const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
// const path = require( 'path' );
// const Dotenv = require( 'dotenv-webpack' );
// const { InjectManifest } = require( 'workbox-webpack-plugin' );
// const CopyPlugin = require( 'copy-webpack-plugin' );

// const webpackPlugins = [
//   new HtmlWebpackPlugin( {
//     template: path.resolve( __dirname, 'public/index.html' ),
//     filename: 'index.html',
//   } ),
//   new Dotenv( {
//     path: './.env', // Path to .env file (this is the default)
//     systemvars: true,
//   } ),
//   new CopyPlugin( {
//     patterns: [
//       { from: './public/favicon.ico', to: '' },
//       { from: './public/manifest.json', to: '' },
//       { from: './public/logo192.png', to: '' },
//       { from: './public/logo512.png', to: '' },
//     ],
//   } ),

// ];

// if ( 'production' === process.env.NODE_ENV ) {
//   webpackPlugins.push( new InjectManifest( {
//     swSrc: './src/serviceWorker.js',
//     swDest: 'serviceWorker.js',
//   } ) );
// }

// module.exports = {
//   context: __dirname,
//   entry: './src/index.js',
//   resolve: {
//     extensions: ['.js', '.jsx']
      
//   },
//   output: {
//     path: path.resolve( __dirname, 'dist' ),
//     filename: 'main.js',
//     publicPath: '/',
//   },
//   devServer: {
//     historyApiFallback: true,
//   },

//   module: {
//     rules: [
//       {
//         test: /\.(js|jsx)$/,
//         use: 'babel-loader',
//       },
//       {
//         test: /\.css?$/,
//         use: [ 'style-loader', 'css-loader' ],
//       },
//       {
//         test: /\.(png|j?g|svg|gif)?$/,
//         use: 'file-loader?name=./images/[name].[ext]',
//       },
//     ],
//   },
//   plugins: webpackPlugins,
// };

const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const path = require( 'path' );
const Dotenv = require( 'dotenv-webpack' );
const { InjectManifest } = require( 'workbox-webpack-plugin' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


const webpackPlugins = [
  new HtmlWebpackPlugin( {
    template: path.resolve( __dirname, 'public/index.html' ),
    filename: 'index.html',
  } ),
  new Dotenv( {
    path: './.env', // Path to .env file (this is the default)
    systemvars: true,
  } ),
  new CopyPlugin( {
    patterns: [
      { from: './public/favicon.ico', to: '' },
      { from: './public/manifest.json', to: '' },
      { from: './public/logo192.png', to: '' },
      { from: './public/logo512.png', to: '' },
      { from: './public/assets', to: 'assets' },
    ],
  }),
  new MiniCssExtractPlugin({
    filename: 'static/css/[name].[contenthash:8].css',
  }),

];

if ( 'production' === process.env.NODE_ENV ) {
  webpackPlugins.push( new InjectManifest( {
    swSrc: './src/serviceWorker.js',
    swDest: 'serviceWorker.js',
  } ) );
}

module.exports = {
  context: __dirname,
  entry: './src/index.js',
  resolve: {
    extensions: ['.js', '.jsx']
      
  },
  output: {
    path: path.resolve( __dirname, 'dist' ),
    filename: 'static/js/[name].[contenthash:8].js', // Changed output filename pattern
    publicPath: '/',
  },
  devServer: {
    historyApiFallback: true,
  },
  optimization: {
    runtimeChunk: 'single',
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
      },
      {
        test: /\.css?$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|j?g|svg|gif|ttf)?$/,
        use: 'file-loader?name=static/media/[name].[hash:8].[ext]',
      },
    ],
  },
  plugins: webpackPlugins,
};