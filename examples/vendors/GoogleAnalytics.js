import analytics from "analytics.js";
/**
 * Performs the tracking calls to Google Analytics.
 * Utilizing Segment IO Analytics Integration.
 *
 * @module GoogleAnalytics
 * @class
 * @internal
 */
class GoogleAnalytics {
    constructor(options = {}) {
        this.name = "Google Analytics";
        this._loaded = false;
        this.options = options;
    }
    /**
     *
     * @method pageView
     * @param {String} eventName
     * @param {Object} params
     * @returns {Promise}
     * @internal
     */
    pageView(...args) {
        return this.track(...args);
    }
    user(userId) {
        return new Promise((resolve) => {
            this.userId = userId;
            resolve({
                userId
            });
        });
    }
    /**
     *
     * @method track
     * @param {String} eventName
     * @param {Object} params
     * @returns {Promise}
     * @internal
     */
    track(eventName, params) {
        return new Promise((resolve, reject) => {
            this._load().then(() => {
                this._track(eventName, params);
                resolve({
                    eventName,
                    params
                });
            }).catch((error) => {
                console.error("GA: Failed to initialize", error);
                reject(error);
            });
        });
    }
    /**
     *
     * @method _track
     * @param {String} eventName
     * @param {Object} params
     * @protected
     */
    _track(eventName, params) {
        if (eventName === "pageView") {
            analytics.page(params.category, params);
            return;
        }
        analytics.track(eventName, params);
    }
    /**
     *
     * @method _load
     * @protected
     */
    _load() {
        return this._promise || (this._promise = new Promise((resolve) => {
            if (this._loaded) {
                resolve();
            } else {
                analytics.once("ready", () => {
                    this._loaded = true;
                    resolve();
                });
                analytics.initialize({
                    "Google Analytics": this.options
                });
            }
        }));
    }
}

export default GoogleAnalytics;
