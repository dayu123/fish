'use strict';
const path = require('path');
const webpack = require('webpack');
const findParam = require('./script/findEnv');

let common_config = {
    entry: ['./test/test', './src/main'],
    output: {
        filename: 'js/bundle.js',
        path: path.join(__dirname, 'bin'),
    },
    resolve: {
        modules: [
            path.resolve('./libs'),
            path.resolve('./src'),
            path.resolve('./node_modules'),
        ],
        extensions: ['.ts', '.js', '.json'],
    },
    module: {
        rules: [
            {
                test: /(\.ts|\.js)$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({ ENV: JSON.stringify(findParam('ENV')) }),
    ],
};
const dev_config = {
    devtool: 'eval-source-map',
    watch: true,
    devServer: {
        host: '0.0.0.0',
        contentBase: path.join(__dirname, 'bin'),
    },
};

const prod_config = {
    entry: [
        'es6-promise/auto',
        'es6-map/implement',
        'es6-set/implement',
        './src/main.ts',
    ],
};
const prod_ts_compile_option = {
    target: 'es5',
    sourceMap: false,
    lib: ['dom', 'es5', 'es2015.promise'],
};

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        return Object.assign(common_config, dev_config);
    } else {
        common_config.module.rules[0].options.compilerOptions = prod_ts_compile_option;
        return Object.assign(common_config, prod_config);
    }
};
