import {
    Component,
    Children,
    createElement,
    cloneElement,
    isValidElement
} from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import invariant from "fbjs/lib/invariant";
import warning from "fbjs/lib/warning";
import MetricsPropTypes from "./PropTypes";
import useTrackBindingPlugin from "../core/useTrackBindingPlugin";

export default class MetricsElement extends Component {
    static contextTypes = {
        metrics: MetricsPropTypes.metrics,
        _metrics: PropTypes.object,
        _metricsConfig: PropTypes.object
    };

    static propTypes = {
        children: PropTypes.node,
        element: PropTypes.any
    };

    componentDidMount() {
        const {metrics, _metricsConfig} = this.context;

        invariant(
            metrics,
            "MetricsElement requires metrics HOC to exist in the parent tree."
        );

        const {
            useTrackBinding,
            attributePrefix,
            suppressTrackBindingWarning
        } = _metricsConfig;

        if (!suppressTrackBindingWarning) {
            warning(
                !useTrackBinding,
                "You are using 'MetricsElement' while default track binding is turned on. " +
                    "It is recommended that you stick with either one to avoid double tracking accidentally. " +
                    "If you intentionally use both and want to suppress this warning, pass 'suppressTrackBindingWarning=true' to the metrics options."
            );
        }

        this._trackBindingListener = useTrackBindingPlugin({
            callback: this._handleClick.bind(this),
            rootElement: ReactDOM.findDOMNode(this),
            attributePrefix,
            traverseParent: true
        });
    }

    componentWillUnmount() {
        if (this._trackBindingListener) {
            this._trackBindingListener.remove();
            this._trackBindingListener = null;
        }
    }

    _handleClick(...args) {
        this.context.metrics.track(...args);
    }

    render() {
        const {element, children, ...rest} = this.props;

        if (!element) {
            return Children.only(children);
        }

        return isValidElement(element)
            ? cloneElement(element, rest)
            : createElement(element, rest, children);
    }
}
