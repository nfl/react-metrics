/* eslint-disable camelcase */
module.exports = function (config) {
    config.set({
        singleRun: true
    });

    if (process.env.USE_CLOUD === "true") {
        require("./karma.conf.cloud.js")(config);
    } else {
        console.log("running default test on Chrome");
        config.set({
            customLaunchers: {
                Chrome_CI: {
                    base: "Chrome",
                    flags: ["--no-sandbox"]
                }
            },
            browsers: ["Chrome_CI"]
        });
    }
};
