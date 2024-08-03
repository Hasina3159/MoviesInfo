const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.js', // Entrée principale de votre application
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i, // Règle pour les fichiers CSS
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.html$/i, // Règle pour les fichiers HTML
        loader: 'html-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.html', // Fichier HTML de base
    }),
    new Dotenv(), // Pour utiliser les variables d'environnement
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
  },
};
