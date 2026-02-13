const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');

const plugins = [];

if (process.env.BETA) {
    plugins.push(
        new CopyPlugin({
            patterns: [{ from: '.', to: '../', context: 'public-beta', force: true }],
            options: {},
        }),
    );
}

module.exports = merge(common, {
    mode: 'production',
    plugins,
});