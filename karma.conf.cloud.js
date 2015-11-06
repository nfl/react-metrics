/* eslint-disable camelcase */
module.exports = function (config) {
    // https://saucelabs.com/platforms
    var customLaunchers = {
        SL_Chrome: {
            base: "SauceLabs",
            browserName: "Chrome",
            version: "45"
        },
        SL_Chrome_Latest: {
            base: "SauceLabs",
            browserName: "Chrome",
            version: "46"
        },
        SL_Firefox: {
            base: "SauceLabs",
            browserName: "Firefox",
            version: "40"
        },
        SL_Firefox_Latest: {
            base: "SauceLabs",
            browserName: "Firefox",
            version: "41"
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
            platform: "OS X 10.11",
            version: "9.1"
        },
        SL_OSX_Safari8: {
            base: "SauceLabs",
            browserName: "Safari",
            platform: "OS X 10.10",
            version: "8"
        },
        SL_OSX_Safari9: {
            base: "SauceLabs",
            browserName: "Safari",
            platform: "OS X 10.11",
            version: "9"
        },
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
            version: "5.1"
        }
    };

    // "saucelabs" reporter is necessary for their status badge to reflect the test result.
    config.set({
        captureTimeout: 120000,
        browserNoActivityTimeout: 1500000,
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
        reporters: ["dots", "saucelabs"]
    });

    if (process.env.DEBUG_SAUCE) {
        config.sauceLabs.connectOptions = {
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
            port: 5757
        };
        config.sauceLabs.build = "TRAVIS #" + process.env.TRAVIS_BUILD_NUMBER + " (" + process.env.TRAVIS_BUILD_ID + ")";
        config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
        // TODO: remove once SauceLabs supports websockets.
        // This speeds up the capturing a bit, as browsers don"t even try to use websocket.
        console.log(">>>> setting socket.io transport to polling <<<<");
        config.transports = ["polling"];
    }
};
