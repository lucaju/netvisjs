const path = require('path');
const webpack = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: 'none', // all mode defaults for dev and prod and set in the respective configs
	entry: {
		app: './src/AppConfig.js',
		'reset/reset': './src/reset/AppResetConfig.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
	devtool: 'inline-source-map',
	module: {
		rules: [{
				test: /\.(js|jsx)$/,
				use: [{
					loader: 'babel-loader',
					options: {
						sourceType: 'unambiguous',
						presets: [
							'@babel/preset-env',
						],
						plugins: [
							['@babel/plugin-transform-runtime', {
								'absoluteRuntime': false,
								'corejs': false,
								'helpers': false,
								'regenerator': true,
								'useESModules': true
							}]
						]
					}
				}]
			},
			{
				test: /\.css$/,
				use: [{
						loader: MiniCssExtractPlugin.loader,
						options: {
							// you can specify a publicPath here
							// by default it uses publicPath in webpackOptions.output
							publicPath: '../',
							hmr: process.env.NODE_ENV === 'development',
							esModule: true,
						},
					},
					'css-loader',
				],
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: [
					'file-loader',
				],
			},
			{
				test: /\.(html)$/,
				use: {
					loader: 'html-loader',
				}
			},
			{
				test: /\.svg$/,
				loader: 'svg-inline-loader'
			}
		],
	},
	plugins: [
		new webpack.ProgressPlugin(),
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets: false
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: 'index.html',
			chunks: ['app'],
			inject: 'head'
		}),
		new HtmlWebpackPlugin({
			template: './src/reset/reset.html',
			filename: 'reset/index.html',
			chunks: ['reset/reset'],
			excludeChunks: ['app', 'install/app'],
			inject: 'head'
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[id].css',
			moduleFilename: ({
				name
			}) => `${name.replace('/js/', '/css/')}.css`,
		}),
		new MiniCssExtractPlugin({
			filename: 'reset/[name].css',
			chunkFilename: 'reset/[id].css',
			moduleFilename: ({
				name
			}) => `${name.replace('/js/', '/css/')}.css`,
		}),
		new CopyWebpackPlugin({
			patterns: [{
				from: 'src/app.html',
				to: ''
			},
			{
				from: '**/*.html',
				to: './components/[path]/[name].html',
				toType: 'template',
				context: './src/components/'
			},
			{
				from: 'src/assets/',
				to: './assets'
			},
		]})
	],
	// optimization: {
	// splitChunks: {
	// 	chunks: 'all',
	// 	minSize: 30000,
	// 	maxSize: 0,
	// 	minChunks: 1,
	// 	maxAsyncRequests: 5,
	// 	maxInitialRequests: 3,
	// 	automaticNameDelimiter: '~',
	// 	name: true,
	// cacheGroups: {
	// 	vendors: {
	// 		test: /[\\/]node_modules[\\/]/,
	// 		priority: -10
	// 	},
	// 	// appStyles: {
	// 	// 	name: 'app',
	// 	// 	test: (m, c, entry = 'app') =>
	// 	// 		m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
	// 	// 	chunks: 'all',
	// 	// 	enforce: true,
	// 	// },
	// 	// installStyles: {
	// 	// 	name: 'install',
	// 	// 	test: (m, c, entry = 'install') =>
	// 	// 		m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
	// 	// 	chunks: 'all',
	// 	// 	enforce: true,
	// 	// },
	// 	// resetpwdStyles: {
	// 	// 	name: 'resetpwd',
	// 	// 	test: (m, c, entry = 'resetpwd') =>
	// 	// 		m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
	// 	// 	chunks: 'all',
	// 	// 	enforce: true,
	// 	// },
	// 	default: {
	// 		minChunks: 2,
	// 		priority: -20,
	// 		reuseExistingChunk: true
	// 	}
	// }
	// }
	// }
};