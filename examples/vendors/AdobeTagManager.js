/**
 * Performs the tracking calls to Adobe Tag Manager.
 * @module AdobeTagManager
 * @class
 * @internal
 */
class AdobeTagManager {
    constructor(options = {}) {
        this.options = options;
        this.name = "Adobe Tag Manager";
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
            this._load().then((satellite) => {
                this._satellite = this._satellite || satellite;
                this._track(eventName, params);
                resolve({
                    eventName,
                    params
                });
            }).catch((error) => {
                console.error("Omniture: Failed to load seed file", error);
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
        this._satellite.data.customVars = {};
        this._satellite.setVar(params);
        this._satellite.track(eventName);
    }
    /**
     *
     * @method _load
     * @protected
     */
    _load() {
        return this._promise || (this._promise = new Promise((resolve, reject) => {
            if (window._satellite) {
                resolve(window._satellite);
            } else {
                const script = document.createElement("script");

                script.onload = () => {
                    this._addPageBottom();
                    resolve(window._satellite);
                };

                script.onerror = (error) => {
                    reject(error);
                };

                script.src = this.options.seedFile;
                document.head.appendChild(script);
            }
        }));
    }
    /**
     *
     * @method _addPageBottom
     * @protected
     */
    _addPageBottom() {
        const body = document.body;
        const script = document.createElement("script");
        // Lets add to page so Adobe consultant knows we've added the pageBottom() call.
        const scriptContent = `
            "use strict";

            var _satellite = window._satellite;

            if (_satellite) {
                _satellite.pageBottom();
            }
        `;

        script.text = scriptContent;
        return body.appendChild(script);
    }
}

export default AdobeTagManager;
