import React, {Component} from "react";
import hoistStatics from "hoist-non-react-statics";
import PropTypes from "./PropTypes";

const mountedInstances = [];

export function getMountedInstances() {
    return mountedInstances;
}

// convenient method for unit test
export function clearMountedInstances() {
    mountedInstances.length = 0;
}

function getDisplayName(Comp) {
    return Comp.displayName || Comp.name || "Component";
}

function wrap(ComposedComponent) {
    class Metrics extends Component {
        static displayName = `Metrics(${getDisplayName(ComposedComponent)})`;

        // context unit test fails w/o this, why??
        static contextTypes = {
            metrics: PropTypes.metrics
        };

        componentWillMount() {
            mountedInstances.push(Metrics);
        }

        componentWillUnmount() {
            const index = mountedInstances.indexOf(this);
            mountedInstances.splice(index, 1);
        }

        render() {
            return (
                <ComposedComponent {...this.props} {...this.context}/>
            );
        }
    }
    return hoistStatics(Metrics, ComposedComponent);
}

export default function useMetrics(...args) {
    if (typeof args[0] === "function") {
        return wrap(...args);
    }

    return target => {
        return wrap(target, ...args);
    };
}
