module.exports = {
  entry: './components/main.js',
  output: {
    path: './display',
    filename: 'nomnom.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json']
  }
};
