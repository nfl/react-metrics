import React, {Component} from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import invariant from "fbjs/lib/invariant";
import {canUseDOM} from "fbjs/lib/ExecutionEnvironment";
import {metrics as metricsType, location as locationType} from "./PropTypes";
import createMetrics, {isMetrics} from "../core/createMetrics";
import getRouteState from "./getRouteState";
import findRouteComponent from "./findRouteComponent";
import hoistStatics from "hoist-non-react-statics";

function getDisplayName(Comp) {
    return Comp.displayName || Comp.name || "Component";
}

let mountedInstances;

export default function metrics(metricsOrConfig, options = {}) {
    const autoTrackPageView = options.autoTrackPageView !== false;
    const useTrackBinding = options.useTrackBinding !== false;
    const attributePrefix = options.attributePrefix;
    const suppressTrackBindingWarning = !!options.suppressTrackBindingWarning;
    const getNewRouteState = options.getRouteState || getRouteState;
    const findNewRouteComponent =
        options.findRouteComponent || findRouteComponent;

    const metricsInstance = isMetrics(metricsOrConfig)
        ? metricsOrConfig
        : createMetrics(metricsOrConfig);

    return function wrap(ComposedComponent) {
        class MetricsContainer extends Component {
            static displayName = "MetricsContainer";

            static childContextTypes = {
                metrics: metricsType.isRequired,
                _metricsConfig: PropTypes.object
            };

            static propTypes = {
                location: locationType,
                params: PropTypes.object
            };

            static getMountedMetricsInstances() {
                // eslint-disable-line react/sort-comp
                if (!mountedInstances) {
                    mountedInstances = [];
                }
                return mountedInstances;
            }

            componentWillMount() {
                if (!canUseDOM) {
                    return;
                }

                const instances = this.constructor.getMountedMetricsInstances();
                instances.push(ComposedComponent);

                this._newRouteState = getNewRouteState(this.props);
                if (this._newRouteState) {
                    this._getMetrics().setRouteState(this._newRouteState);
                }
            }
            componentDidMount() {
                if (useTrackBinding) {
                    const rootElement = ReactDOM.findDOMNode(this);
                    // TODO: is this invariant check still valid after react >= 0.14.0?
                    invariant(
                        rootElement,
                        "`metrics` should be added to the root most component which renders node element for declarative tracking to work."
                    );
                    this._getMetrics().useTrackBinding(
                        rootElement,
                        attributePrefix
                    );
                }

                if (this._newRouteState) {
                    this._handleRouteStateChange(this._newRouteState);
                    this._newRouteState = null;
                }
            }
            componentWillReceiveProps(newProps) {
                this._newRouteState = getNewRouteState(newProps, this.props);
                if (this._newRouteState) {
                    this._getMetrics().setRouteState(this._newRouteState);
                }
            }
            componentDidUpdate() {
                if (this._newRouteState) {
                    this._handleRouteStateChange(this._newRouteState);
                    this._newRouteState = null;
                }
            }
            componentWillUnmount() {
                const instances = this.constructor.getMountedMetricsInstances();
                const index = instances.indexOf(ComposedComponent);
                instances.splice(index, 1);

                this._getMetrics().destroy();
            }

            getChildContext() {
                return {
                    metrics: this._getMetrics().api,
                    _metricsConfig: {
                        autoTrackPageView,
                        useTrackBinding,
                        attributePrefix,
                        suppressTrackBindingWarning,
                        getNewRouteState,
                        findNewRouteComponent
                    }
                };
            }

            _getMetrics() {
                return metricsInstance;
            }
            /**
             * Triggered when the route changes and fires page view tracking.
             *
             * @method _handleRouteStateChange
             * @param {Object} props
             * @private
             */
            _handleRouteStateChange(routeState) {
                const component = findNewRouteComponent();
                const metricsInst = this._getMetrics();
                let pageViewParams;
                let shouldSuppress = false;

                if (component) {
                    const ret =
                        component.willTrackPageView &&
                        component.willTrackPageView(routeState);
                    if (ret === false) {
                        shouldSuppress = true;
                    } else if (ret) {
                        pageViewParams = ret;
                    }
                }

                if (
                    metricsInst.enabled &&
                    autoTrackPageView &&
                    !shouldSuppress
                ) {

                    invariant(
                        typeof metricsInst.api.pageView === "function",
                        "react-metrics: 'pageView' api needs to be defined for automatic page view tracking."
                    );
                    metricsInst.api.pageView(pageViewParams);
                }
            }
            /**
             * Renders composed component.
             *
             * @method render
             * @returns {ReactElement}
             */
            render() {
                return (
                    <ComposedComponent
                        {...this.props}
                        {...this.getChildContext()}
                    />
                );
            }
        }

        return hoistStatics(MetricsContainer, ComposedComponent);
    };
}
