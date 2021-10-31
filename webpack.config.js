const path = require('path');

module.exports = {
    entry: {
        "summary-out": "./summary-app/index.tsx",
    },
    output: {
        path: path.resolve(__dirname, 'summary-out'),
        filename: "[name].js"
    },
    devtool: "eval-source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {}
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    }
                ]
            }
        ]
    },
    performance: {
        hints: false
    }
};
