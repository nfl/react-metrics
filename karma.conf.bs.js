/* eslint-disable camelcase */
module.exports = function (config) {
    // https://www.browserstack.com/list-of-browsers-and-platforms
    // https://api.browserstack.com/4/browsers?flat=true
    // real mobile device test is not supported for `Automate` yet
    var customLaunchers = {
        BS_Chrome: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "8.1",
            browser: "chrome",
            browser_version: "45.0"
        },
        BS_Chrome_Latest: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "8.1",
            browser: "chrome",
            browser_version: "46.0"
        },
        BS_Firefox: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "8.1",
            browser: "firefox",
            browser_version: "41.0"
        },
        BS_Firefox_Latest: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "8.1",
            browser: "firefox",
            browser_version: "42.0"
        },
        BS_iOS8_Safari: {
            base: "BrowserStack",
            os: "ios",
            os_version: "8.3",
            browser: "Mobile Safari",
            device: "iPhone 6 Plus",
            real_mobile: false
        },
        BS_iOS9_Safari: {
            base: "BrowserStack",
            os: "ios",
            os_version: "9.0",
            browser: "Mobile Safari",
            device: "iPhone 6S Plus",
            real_mobile: false
        },
        BS_OSX_Safari8: {
            base: "BrowserStack",
            os: "OS X",
            os_version: "Yosemite",
            browser: "safari",
            browser_version: "8.0"
        },
        BS_OSX_Safari9: {
            base: "BrowserStack",
            os: "OS X",
            os_version: "El Capitan",
            browser: "safari",
            browser_version: "9.0"
        },
        BS_InternetExplorer10: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "8",
            browser: "ie",
            browser_version: "10.0"
        },
        BS_InternetExplorer11: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "8.1",
            browser: "ie",
            browser_version: "11.0"
        },
        BS_Edge: {
            base: "BrowserStack",
            os: "Windows",
            os_version: "10",
            browser: "edge",
            browser_version: "12.0"
        },
        BS_ANDROID4: {
            base: "BrowserStack",
            os: "android",
            os_version: "4.4",
            browser: "Android Browser"
        }/*,
        BS_ANDROID5: { // BrowserStack says this does not work as Android 5.x doesn't support communication via proxy
            base: "BrowserStack",
            os: "android",
            os_version: "5.0",
            browser: "Android Browser"
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
