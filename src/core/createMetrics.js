import EventEmitter from "eventemitter3";
import querystring from "querystring";
import {canUseDOM} from "fbjs/lib/ExecutionEnvironment";
import invariant from "fbjs/lib/invariant";
import warning from "fbjs/lib/warning";
import ActionTypes from "./ActionTypes";
import createService from "./createService";
import extractApis from "./utils/extractApis";
import isPromise from "./utils/isPromise";
import useTrackBindingPlugin from "./useTrackBindingPlugin";

const qs = canUseDOM ? querystring.decode(window.location.search.substr(1)) : {};
const defaults = {
    pageViewEvent: "pageLoad",
    pageDefaults: () => ({}),
    requestTimeout: 15 * 1000
};

class Transaction {
    constructor() {
        this.pvTransactions = {};
        this.transactionId = 0;
    }

    create() {
        return ++this.transactionId;
    }

    current() {
        return this.transactionId;
    }

    get(tId) {
        return this.pvTransactions[tId];
    }

    set(tId, value) {
        this.pvTransactions[tId] = value;
    }

    remove(tId) {
        if (tId && this.pvTransactions[tId]) {
            delete this.pvTransactions[tId];
        }
    }

    keys() {
        return Object.keys(this.pvTransactions);
    }
}

export class Metrics extends EventEmitter {
    constructor(options = {}) {
        if (!options.vendors) {
            throw new Error("'vendors' option is required.");
        }
        super();
        this.enabled = options.enabled !== false;
        // undocumented option for unit test.
        this.canUseDOM = (options.canUseDOM !== undefined) ? !!options.canUseDOM : canUseDOM;
        if (!this.canUseDOM) {
            this.enabled = false;
        }
        this.debug = !!options.debug || qs.metrics_debug === "true";
        this.customParams = options.customParams || {};
        this.pageDefaults = options.pageDefaults || defaults.pageDefaults;
        this.pageViewEvent = options.pageViewEvent || defaults.pageViewEvent;
        this.requestTimeout = options.requestTimeout || defaults.requestTimeout;
        this.cancelOnNext = options.cancelOnNext !== undefined ? !!options.cancelOnNext : true;
        this.vendors = Array.isArray(options.vendors) ? options.vendors : [options.vendors];
        this.services = (this.vendors).map(vendor => createService(vendor));
        this.apiList = extractApis(this.services.map(service => service.apis));
        this.transaction = new Transaction();
        this.routeState = {};
        this.apiImpl = this.apiList.reduce((impl, api) => {
            impl[api] = (...args) => this._prepareTrack(api, ...args);
            return impl;
        }, {});
        Object.freeze(this.apiImpl);
    }

    listen(type, callback) {
        // if type is not specified, listen for all the apis.
        if (typeof type === "function") {
            callback = type;
            type = null;
        }

        if (type) {
            this.on(type, callback);
        } else {
            this.apiList.forEach(api => {
                this.on(api, callback);
            });
        }

        return () => {
            if (type) {
                this.removeListener(type, callback);
            } else {
                this.apiList.forEach(api => {
                    this.removeListener(api, callback);
                });
            }
        };
    }

    setRouteState(state) {
        this._cancelPreviousPromiseIfPending();
        this.routeState = state;
    }

    useTrackBinding(rootElement, attributePrefix) {
        if (!this.enabled) {
            return;
        }

        // if 'false' is passed as first param, detach listeners
        if (rootElement === false) {
            this._removeTrackBindingListener();
            return;
        }

        invariant(
            typeof this.api.track === "function",
            "Metrics 'track' method needs to be defined for declarative tracking."
        );

        if (this._trackBindingListener) {
            this._removeTrackBindingListener();
        }

        this._trackBindingListener = useTrackBindingPlugin({
            callback: this._handleClick.bind(this),
            rootElement,
            attributePrefix
        });

        return this._removeTrackBindingListener.bind(this);
    }

    destroy() {
        this._removeListeners();
        this._removeTrackBindingListener();
    }

    get api() {
        return this.apiImpl;
    }
    /**
     * @method _callServices
     * @param type
     * @param promise
     * @returns {Promise.<T>}
     * @private
     */
    _callServices(type, promise) {
        return promise.then(params => {
            const results = [];
            const services = this.services;
            const requestTimeout = this.requestTimeout;

            function isCompleted() {
                return results.length === services.length;
            }

            function clearTimer(timer) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
            }

            return new Promise(resolve => {
                function process(result) {
                    if (this.isTimeout) {
                        return;
                    }
                    this.isTimeout = true;
                    clearTimer(this.timer);
                    results.push(result);
                    if (isCompleted()) {
                        resolve(results);
                    }
                }

                services.map(service => {
                    const {apis, name} = service;
                    const apiExists = apis && apis[type];
                    if (apiExists) {
                        warning(
                            typeof apis[type] === "function",
                            `'${type}'${name ? `(${name} Service)` : ""} is not a function`
                        );
                    }
                    let requestPromise = (apiExists && typeof apis[type] === "function") ? apis[type](...params) : undefined;
                    if (!isPromise(requestPromise)) {
                        requestPromise = Promise.resolve(requestPromise);
                    }
                    requestPromise.isTimeout = false;
                    requestPromise.timer = setTimeout(
                        process.bind(requestPromise),
                        requestTimeout,
                        {name, params, error: new Error(`Request time out after ${requestTimeout} ms.`), status: "failure"}
                    );
                    return requestPromise
                        .then(response => ({name, params, response, status: "success"}))
                        .catch(error => ({name, params, error, status: "failure"}))
                        .then(process.bind(requestPromise));
                });
            });
        });
    }
    /**
     * Cancels page view promise if it's still pending while the route has changed.
     *
     * @method _cancelPreviousPromiseIfPending
     * @private
     */
    _cancelPreviousPromiseIfPending() {
        this.routeState = {};
        this.transaction.keys().forEach(tId => {
            const entry = this.transaction.get(tId);
            if (entry && entry.cancelOnNext) {
                entry.shouldCancel = true;
            }
        });
    }

    /**
     * @method _createTransaction
     * @param args
     * @private
     */
    _createTransaction(args) {
        const tId = this.transaction.current();
        const cancelOnNext = this.cancelOnNext;
        this.transaction.set(tId, {
            promise: args[0],
            cancelOnNext
        });
        args.push(tId);
    }
    /**
     * @method _clearTransaction
     * @param tId
     * @private
     */
    _clearTransaction(tId) {
        this.transaction.remove(tId);
    }
    /**
     * @method _doTrack
     * @param type
     * @param promise
     * @param tId
     * @private
     */
    _doTrack(type, promise, tId) {
        promise = this._callServices(type, promise);
        const dispatchEvent = function (status, response, error) {
            const eventFacade = {
                type,
                status
            };
            if (response) {
                eventFacade.response = response;
            } else if (error) {
                eventFacade.error = error;
            }
            if (tId) {
                eventFacade.transactionId = tId;
                this._clearTransaction(tId);
            }
            this.emit(type, eventFacade);
            if (this.debug) {
                console.log("track result", eventFacade);
            }
        }.bind(this);

        promise
            .then(response => {
                dispatchEvent(response.every(item => item.status === "success") ? "success" : "failure", response);
            })
            .catch(error => {
                dispatchEvent("failure", null, error);
            });
    }
    /**
     * Returns the default tracking data provided by a helper object.
     *
     * @method __getDefaultData
     * @return {Object}
     * @private
     */
    _getDefaultData(state) {
        return this.pageDefaults(state);
    }
    /**
     * Returns a merged data between the host passed object and the default tracking data provided by a helper object.
     *
     * @method __mergeWith
     * @return {Object}
     * @private
     */
    _mergeWith(data, state) {
        return Object.assign({}, this._getDefaultData(state), this.customParams, data);
    }
    /**
     * Checks if this promise should be cancelled by rejecting it before it's sent to the facade.
     *
     * @method __addCancelHook
     * @param {Promise} promise
     * @returns {Promise}
     * @private
     */
    _addCancelHook(promise) {
        const tId = this.transaction.create();
        return promise.then(data => {
            return this.transaction.get(tId).shouldCancel ? Promise.reject(new Error("Page view cancelled")) : data;
        });
    }
    /**
     * Modify the data to include 'eventName' before it's sent to the facade.
     *
     * @method __addEventNameToPromise
     * @param {String} eventName
     * @param {Promise} promise
     * @param {boolean} shouldMerge
     * @returns {Promise}
     * @private
     */
    _addEventNameToPromise(eventName, promise, shouldMerge) {
        return promise.then(function (state, data) {
            data = [shouldMerge ? this._mergeWith(data, state) : data];
            data.unshift(eventName);
            return data;
        }.bind(this, this.routeState));
    }
    /**
     * Run checks to the arguments passed to 'pageView' and 'track', set default page view eventName if it's not provided.
     * Also merges the default data with the passed pageView data, and optionally for track data if a flag is set.
     *
     * @method __inspectArguments
     * @param {String} type
     * @param args
     * @returns {Array}
     * @private
     */
    _inspectArguments(type, ...args) {
        let shouldMerge = true;
        if (type !== ActionTypes.PAGE_VIEW) {
            // don't merge `pageDefaults` with track params unless it's explicitly requested by the third argument.
            shouldMerge = false;
            if (type === ActionTypes.TRACK) {
                invariant(
                    typeof args[0] === "string",
                    "Metrics 'track' method requires 'eventName' string as the first argument and object or promise as the second argument."
                );
            }
            // this might be confusing but for now, use the last argument as a flag for merge when it's boolean.
            if (args.length >= 3 && typeof args[args.length - 1] === "boolean") {
                shouldMerge = args[args.length - 1];
            }
        }

        // set default page view event name when missing.
        let [eventName, params] = args;
        if (!params && typeof eventName !== "string") {
            params = eventName;
            eventName = (type === ActionTypes.PAGE_VIEW) ? this.pageViewEvent : null;
        }

        // make sure `params` is a promise.
        if (!isPromise(params)) {
            params = Promise.resolve(params);
        }

        // add cancel hook so that it can be cancelled(rejected) if the promise is still pending when the route changes.
        if (type === ActionTypes.PAGE_VIEW) {
            params = this._addCancelHook(params);
        }

        // PAGE_VIEW or TRACK should always have `eventName`.
        if (eventName) {
            params = this._addEventNameToPromise(eventName, params, shouldMerge);
        }
        args = [type, params];

        if (type === ActionTypes.PAGE_VIEW) {
            this._createTransaction(args);
        }

        return args;
    }
    /**
     * @method _prepareTrack
     * @param type
     * @param args
     * @private
     */
    _prepareTrack(type, ...args) {
        if (!this.enabled) {
            return;
        }
        args = this._inspectArguments(type, ...args);
        this._doTrack(...args);
    }
    /**
     * A click handler to perform custom link tracking, any element with 'metrics-*' attribute will be tracked.
     *
     * @method _handleClick
     * @param {Object} params
     * @private
     */
    _handleClick(...args) {
        this.api.track(...args);
    }
    _removeListeners() {
        this.removeAllListeners();
    }
    _removeTrackBindingListener() {
        if (this._trackBindingListener) {
            this._trackBindingListener.remove();
            this._trackBindingListener = null;
        }
    }
}

export function isMetrics(value) {
    return (
        value &&
        typeof value.listen === "function" &&
        typeof value.setRouteState === "function" &&
        typeof value.useTrackBinding === "function" &&
        typeof value.destroy === "function" &&
        typeof value.api === "object"
    );
}

export default function createMetrics(options) {
    const metrics = new Metrics(options);
    return {
        listen: metrics.listen.bind(metrics),
        setRouteState: metrics.setRouteState.bind(metrics),
        useTrackBinding: metrics.useTrackBinding.bind(metrics),
        destroy: metrics.destroy.bind(metrics),
        get enabled() {return metrics.enabled;},
        get api() {return metrics.api;}
    };
}

