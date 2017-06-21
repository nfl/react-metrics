const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

function isDirectory(dir) {
    return fs.lstatSync(dir).isDirectory();
}

module.exports = {
    devtool: "inline-source-map",

    entry: fs.readdirSync(__dirname).reduce((entries, dir) => {
        const isNodeModules = dir === "node_modules";
        const isSrc = dir === "src";
        const dirPath = path.join(__dirname, dir);
        if (!isNodeModules && !isSrc && isDirectory(dirPath)) {
            fs.readdirSync(dirPath).forEach(subdir => {
                if (isDirectory(path.join(dirPath, subdir))) {
                    entries[[dir, subdir].join("_")] = [
                        "babel-polyfill",
                        path.join(dirPath, subdir, "app.js")
                    ];
                }
            });
        }

        return entries;
    }, {}),

    output: {
        path: "examples/__build__",
        filename: "[name].js",
        chunkFilename: "[id].chunk.js",
        publicPath: "/__build__/"
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel",
                query: {
                    presets: ["es2015-without-strict", "stage-0", "react"],
                    plugins: ["transform-decorators-legacy"]
                }
            },
            {
                test: /\.json?$/,
                loader: "json-loader"
            }
        ]
    },

    resolve: {
        alias: {
            "react-metrics": `${process.cwd()}/src`
        }
    },

    cache: false,

    plugins: [
        new webpack.optimize.CommonsChunkPlugin("shared.js"),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(
                process.env.NODE_ENV || "development"
            )
        })
    ]
};
