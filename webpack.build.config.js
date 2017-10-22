var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: path.join(__dirname, 'src/app.ts'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'game.js'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            pixi: path.join(__dirname, 'node_modules/phaser-ce/build/custom/pixi.js'),
            phaser: path.join(__dirname, 'node_modules/phaser-ce/build/custom/phaser-split.js'),
            p2: path.join(__dirname, 'node_modules/phaser-ce/build/custom/p2.js'),
            assets: path.join(__dirname, 'assets/'),
            config: path.join(__dirname, 'src/config.json')
        }
    },
    plugins: [
        new CleanWebpackPlugin([
            path.join(__dirname, 'dist')
        ]),
        new webpack.ProvidePlugin({
            'config': 'config'
        }),
        new HtmlWebpackPlugin({
            title: 'BUILD: Match3-mini-game!',
            template: path.join(__dirname, 'templates/index.ejs')
        }),
        new UglifyJSPlugin({
          uglifyOptions: {
            compress: {
              warnings: false,
              properties: false
            }
          }
        })
    ],
    module: {
        rules: [
          { test: /\.ts$/, enforce: 'pre', loader: 'tslint-loader' },
          { test: /\.(jpg|png|xml|mp3|ogg|m4a|fnt|ac3)$/, loader: 'file-loader?name=assets/[hash].[ext]' },
          { test: /pixi\.js$/, loader: 'expose-loader?PIXI' },
          { test: /phaser-split\.js$/, loader: 'expose-loader?Phaser' },
          { test: /p2\.js$/, loader: 'expose-loader?p2' },
          { test: /\.ts$/, exclude: '/node_modules/', loader: 'ts-loader' }
        ]
    }
};
