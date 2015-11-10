/* eslint-disable camelcase */
module.exports = function (config) {
    // https://www.browserstack.com/list-of-browsers-and-platforms
    var customLaunchers = {
        BS_Chrome: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "8.1",
            browser: "chrome",
            browser_version: "45"
        },
        BS_Chrome_Latest: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "8.1",
            browser: "chrome",
            browser_version: "46"
        },
        BS_Firefox: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "8.1",
            browser: "firefox",
            browser_version: "40"
        },
        BS_Firefox_Latest: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "8.1",
            browser: "firefox",
            browser_version: "41"
        },
        BS_iOS8_Safari: {
            base: "BrowserStack",
            os: "ios",
            os_version: "8.3",
            browser: "iphone",
            real_mobile: false
        },
        BS_OSX_Safari8: {
            base: "BrowserStack",
            os: "OS X",
            os_version: "Yosemite",
            browser: "safari",
            browser_version: "8"
        },
        BS_OSX_Safari9: {
            base: "BrowserStack",
            os: "OS X",
            os_version: "El Capitan",
            browser: "safari",
            browser_version: "9"
        },
        BS_InternetExplorer10: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "8",
            browser: "ie",
            browser_version: "10"
        },
        BS_InternetExplorer11: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "8.1",
            browser: "ie",
            browser_version: "11"
        },
        BS_ANDROID4: {
            base: "BrowserStack",
            os: "android",
            os_version: "4.4",
            browser: "android",
            browser_version: "4.4"
        }/*,
        BS_ANDROID5: {
            base: "BrowserStack",
            os: "android",
            os_version: "5.0",
            browser: "android",
            browser_version: "5"
        }*/
    };

    config.set({
        captureTimeout: 180000,
        browserNoActivityTimeout: 60000,
        browserDisconnectTimeout: 10000,
        browserDisconnectTolerance: 2,
        browserStack: {
            project: "React Metrics",
            pollingTimeout: 10000,
            startTunnel: true
        },
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        reporters: ["dots", "coverage"]
    });

    if (process.env.TRAVIS) {
        config.browserStack.name = process.env.TRAVIS_JOB_NUMBER;
        config.browserStack.build = "TRAVIS #" + process.env.TRAVIS_BUILD_NUMBER + " (" + process.env.TRAVIS_BUILD_ID + ")";
    }
};
