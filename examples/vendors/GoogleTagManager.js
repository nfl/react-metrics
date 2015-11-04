import analytics from "analytics.js";
/**
 * Performs the tracking calls to Google Tag Manager.
 * Utilizing Segment IO Metrics Integration.
 * Note: Not currently working (containerId: GTM-P79HDJ).
 *
 * @module GoogleTagManager
 * @class
 * @internal
 */
class GoogleTagManager {
    constructor(options = {}) {
        this.name = "Google Tag Manager";
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
    user(user) {
        return new Promise((resolve) => {
            // reject(new Error("dummy error"));
            resolve({
                user
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
                console.error("GTM: Failed to initialize", error);
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
                    "Google Tag Manager": this.options
                });
            }
        }));
    }
}

export default GoogleTagManager;
