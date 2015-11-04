import locationEquals from "./locationEquals";
import isLocationValid from "./isLocationValid";

function mergeParam(location, params) {
    return Object.keys(location).reduce((obj, key) => {
        obj[key] = location[key];
        return obj;
    }, {params});
}

export default function getRouteState(newProps, props = {}) {
    if (isLocationValid(newProps.location) &&
        !locationEquals(props.location, newProps.location)) {
        // additional params for the dynamic segments of the URL if available.
        const {location, params} = newProps;
        if (location.params || !params) {
            return location;
        }
        const routeState = mergeParam(location, params);
        return routeState;
    }
    return null;
}
