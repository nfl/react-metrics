/* eslint-disable camelcase */
module.exports = function (config) {
    // https://saucelabs.com/platforms
    var customLaunchers = {
        SL_Chrome: {
            base: "SauceLabs",
            browserName: "Chrome",
            version: "45"
        },
        SL_Firefox: {
            base: "SauceLabs",
            browserName: "Firefox",
            version: "40"
        },
        // FIXME: can never run test on Safari
        /*SL_iOS_Safari: {
            base: "SauceLabs",
            browserName: "iphone",
            platform: "OS X 10.10",
            version: "8.4"
        },
        SL_OSX_Safari: {
            base: "SauceLabs",
            browserName: "Safari",
            platform: "OS X 10.10",
            version: "8"
        },*/
        SL_InternetExplorer10: {
            base: "SauceLabs",
            browserName: "Internet Explorer",
            platform: "Windows 8",
            version: "10"
        },
        SL_InternetExplorer11: {
            base: "SauceLabs",
            browserName: "Internet Explorer",
            platform: "Windows 8.1",
            version: "11"
        }
    };

    console.log("Starting test on Sauce Labs");
    config.set({
        sauceLabs: {
            testName: "React Metrics",
            startConnect: true,
            recordVideo: false,
            recordScreenshots: false,
            options: {
                "selenium-version": "2.47.1",
                "command-timeout": 600,
                "idle-timeout": 600,
                "max-duration": 5400
            }
        },
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        captureTimeout: 120000
    });

    if (process.env.DEBUG_SAUCE) {
        config.sauceLabs.connectOptions = {
            verbose: true,
            doctor: true
        };
    }

    if (process.env.TRAVIS) {
        config.sauceLabs.build = "TRAVIS #" + process.env.TRAVIS_BUILD_NUMBER + " (" + process.env.TRAVIS_BUILD_ID + ")";
        config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
        config.transports = ["xhr-polling"];
    }
};
