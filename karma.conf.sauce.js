/* eslint-disable camelcase */
module.exports = function (config) {
    // TODO: figure out Safari error where socket gets disconnected during the test.
    // https://saucelabs.com/platforms
    var customLaunchers = {
        SL_Chrome: {
            base: "SauceLabs",
            browserName: "chrome",
            version: "45"
        },
        SL_Chrome_Latest: {
            base: "SauceLabs",
            browserName: "chrome",
            version: "46"
        },
        SL_Firefox: {
            base: "SauceLabs",
            browserName: "firefox",
            version: "41"
        },
        SL_Firefox_Latest: {
            base: "SauceLabs",
            browserName: "firefox",
            version: "42"
        },
        SL_iOS8_Safari: {
            base: "SauceLabs",
            browserName: "iphone",
            platform: "OS X 10.10",
            version: "8.4"
        },
        SL_iOS9_Safari: {
            base: "SauceLabs",
            browserName: "iphone",
            platform: "OS X 10.10",
            version: "9.1"
        },
        SL_OSX_Safari8: {
            base: "SauceLabs",
            browserName: "safari",
            platform: "OS X 10.10",
            version: "8"
        },
        SL_OSX_Safari9: {
            base: "SauceLabs",
            browserName: "safari",
            platform: "OS X 10.11",
            version: "9"
        },
        SL_InternetExplorer10: {
            base: "SauceLabs",
            browserName: "internet explorer",
            platform: "Windows 8",
            version: "10"
        },
        SL_InternetExplorer11: {
            base: "SauceLabs",
            browserName: "internet explorer",
            platform: "Windows 8.1",
            version: "11"
        },
        SL_Edge: {
            base: "SauceLabs",
            browserName: "microsoftedge",
            platform: "Windows 10",
            version: "20"
        },
        SL_ANDROID4: {
            base: "SauceLabs",
            browserName: "android",
            platform: "Linux",
            version: "4.4"
        },
        SL_ANDROID5: {
            base: "SauceLabs",
            browserName: "android",
            platform: "Linux",
            version: "5.0"
        }
    };

    // "saucelabs" reporter is necessary for their status badge to reflect the test result.
    config.set({
        captureTimeout: 120000,
        browserNoActivityTimeout: 120000,
        browserDisconnectTimeout: 10000,
        browserDisconnectTolerance: 3,
        sauceLabs: {
            testName: "React Metrics",
            startConnect: true,
            recordVideo: false,
            recordScreenshots: false
        },
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers)
    });

    if (process.env.DEBUG_SAUCE) {
        config.sauceLabs.connectOptions = {
            port: 5050,
            verbose: true,
            doctor: true
        };
    }

    if (process.env.TRAVIS) {
        if (process.env.TRAVIS_PULL_REQUEST !== "false" || process.env.TRAVIS_BRANCH !== "master") {
            process.env.SAUCE_USERNAME = process.env.SAUCE_USERNAME_PR;
            process.env.SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY_PR;
        }
        console.log("SAUCE_USERNAME: ", process.env.SAUCE_USERNAME);
        // Sauce Connect through "karma-sauce-launcher" doesn"t work on Travis, manually run Sauce Connect
        config.sauceLabs.startConnect = false;
        config.sauceLabs.connectOptions = {
            port: 5050
        };
        config.sauceLabs.build = "TRAVIS #" + process.env.TRAVIS_BUILD_NUMBER + " (" + process.env.TRAVIS_BUILD_ID + ")";
        config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
        config.reporters = ["dots", "saucelabs"];
    }
};
