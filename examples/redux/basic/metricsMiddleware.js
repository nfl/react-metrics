import {createMetrics} from "react-metrics"; // eslint-disable-line import/no-unresolved
import MetricsConfig from "./metrics.config";
import ActionTypes from "./ActionTypes";

const metrics = createMetrics({
    ...MetricsConfig,
    debug: true
});

export default function metricsMiddleware({getState}) {
    return next => action => {
        const returnValue = next(action);
        switch (action.type) {
            case ActionTypes.INCLEMENT:
            case ActionTypes.DECLEMENT:
                const {id} = action;
                const state = getState();
                metrics.api.track("counterClick", {
                    id,
                    value: state[`counter${id}`]
                });
                break;
            case ActionTypes.ROUTE_CHANGE:
                const {location} = action;
                const paths = location.pathname.substr(1).split("/");
                const routeState = location;
                metrics.setRouteState(routeState);
                metrics.api.pageView({
                    category: !paths[0] ? "landing" : paths[0]
                });
        }
        return returnValue;
    };
}
