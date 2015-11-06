var webpack = require("webpack");
module.exports = function (config) {
    config.set({
        basePath: "",

        browserNoActivityTimeout: 60000,

        client: {
            mocha: {
                reporter: "html"
            }
        },

        frameworks: [
            "chai-sinon",
            "mocha"
        ],

        files: [
            "test/**/*spec.js"
        ],

        preprocessors: {
            "test/**/*spec.js": ["webpack", "sourcemap"]
        },

        coverageReporter: {
            dir: "build/reports/coverage",
            reporters: [{
                type: "html",
                subdir: "html"
            }, {
                type: "text"
            }]
        },

        webpack: {
            devtool: "inline-source-map",
            module: {
                loaders: [{
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: "babel"
                }, {
                    test: /\.js$/,
                    // exclude this dirs from coverage
                    exclude: /(test|node_modules)\//,
                    loader: "isparta"
                }]
            },
            resolve: {
                extensions: ["", ".js"]
            },
            plugins: [
                new webpack.DefinePlugin({
                    "process.env.NODE_ENV": JSON.stringify("production")
                })
            ],
            watch: true
        },

        webpackServer: {
            noInfo: true
        },

        reporters: [
            "mocha",
            "coverage"
        ],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: ["Chrome"],

        captureTimeout: 60000
    });

    if (process.env.CI) {
        require("./karma.conf.ci.js")(config);
    } else if (process.env.USE_CLOUD === "true") {
        require("./karma.conf.cloud.js")(config);
    }
};
