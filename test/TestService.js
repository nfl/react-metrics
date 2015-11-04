/**
 * Metrics service class for testing.
 * @module TestService
 * @class
 * @internal
 */
class TestService {
    constructor() {
        this.name = "Test Service";
    }
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
        return new Promise(resolve => {
            resolve({
                eventName,
                params
            });
        });
    }

}

export default TestService;
