import ActionTypes from "./ActionTypes";

export function inclement(id) {
    return {
        type: ActionTypes.INCLEMENT,
        id
    };
}

export function declement(id) {
    return {
        type: ActionTypes.DECLEMENT,
        id
    };
}

export function routeChange(location) {
    return {
        type: ActionTypes.ROUTE_CHANGE,
        location
    };
}
