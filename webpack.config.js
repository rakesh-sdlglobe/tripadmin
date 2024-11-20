const path = require('path');

module.exports = {
  entry: './src/index.js',  // Your entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,  // Transform JavaScript files with Babel
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,  // Handle CSS files
        use: [
          'style-loader',  // Inject CSS into the DOM
          {
            loader: 'css-loader',  // CSS loader for bundling CSS
            options: {
              sourceMap: false,  // Disable source maps for CSS
            },
          },
          'postcss-loader',  // PostCSS loader for processing CSS with PostCSS
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,  // Handle image files
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',  // Preserve image filenames
              context: 'src',  // Adjust the context to source folder
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],  // Resolve these extensions
  },
  devtool: 'source-map',  // Enable source maps for JavaScript
  plugins: [
    // Add any plugins you need here
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
  ignoreWarnings: [
    {
      module: /source-map-loader/,
      message: /Failed to parse source map/
    }
  ]
};
