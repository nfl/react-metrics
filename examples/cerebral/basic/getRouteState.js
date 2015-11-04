function isRouteEqual(a, b) {
    if (!a && !b) {
        return true;
    }
    if ((a && !b) || (!a && b)) {
        return false;
    }

    return (
        a.path === b.path &&
        a.search === b.search
    );
}

export default function getRouteState(newProps, props = {}) {
    if (newProps.route &&
        newProps.route.path &&
        !isRouteEqual(props.route, newProps.route)) {
        return newProps.route;
    }
    return null;
}
