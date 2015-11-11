/* eslint-disable camelcase */
module.exports = function (config) {
    if (process.env.BROWSER_TEST === "bs" && process.env.BROWSER_STACK_USERNAME) {
        require("./karma.conf.bs.js")(config);
    } else if (process.env.SAUCE_USERNAME) {
        require("./karma.conf.sauce.js")(config);
    } else {
        process.exit(1);
    }
};
