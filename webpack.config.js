var webpack = require("webpack");
var env = process.env.NODE_ENV;

var reactExternal = {
    root: "React",
    commonjs2: "react",
    commonjs: "react",
    amd: "react"
};

var reactDomExternal = {
    root: "ReactDOM",
    commonjs2: "react-dom",
    commonjs: "react-dom",
    amd: "react-dom"
};

var config = {
    externals: {
        "react": reactExternal,
        "react-dom": reactDomExternal
    },
    module: {
        loaders: [
            {test: /\.js$/, loaders: ["babel-loader"], exclude: /node_modules/}
        ]
    },
    output: {
        library: "ReactMetrics",
        libraryTarget: "umd"
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(env)
        })
    ]
};

module.exports = config;
