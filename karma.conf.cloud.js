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
        SL_iOS_Safari: {
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
        }
    };

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
        browsers: Object.keys(customLaunchers)
    });

    if (process.env.DEBUG_SAUCE) {
        config.sauceLabs.connectOptions = {
            verbose: true,
            doctor: true
        };
    }

    if (process.env.TRAVIS) {
        // Sauce Connect through 'karma-sauce-launcher' doesn't work on Travis, use 'sauce_connect' addon
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
