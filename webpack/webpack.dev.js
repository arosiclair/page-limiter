const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    mode: 'development',
    plugins: [
        new CopyPlugin({
            patterns: [{ from: '.', to: '../', context: 'public-dev', force: true }],
            options: {},
        }),
    ],
});
