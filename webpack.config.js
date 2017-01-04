const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
  devServer: {
    inline: true,
    contentBase: './src'
  },
  output: {
    path: './dist/assets',
    publicPath: 'assets/',
    filename: 'bundle.js'
  },
  entry: './src/assets/index.js',
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css!' },
      { test: /\.scss$/, loaders: ["style", "css", "sass"] },
      { test: /\.(jpe?g|png|gif|svg)$/, loader: "file" }
    ]
  },
  plugins: [
    new BrowserSyncPlugin(
      {
        host: 'localhost',
        port: 3000,
        open: true,
        files: ['src/*.html'],
        // proxy the Webpack Dev Server endpoint through BrowserSync
        proxy: 'http://localhost:8080/'
      },
      // plugin options
      {
        // prevent BrowserSync from reloading the page
        // and let Webpack Dev Server take care of this
        reload: false
      }
    )
  ]
}
