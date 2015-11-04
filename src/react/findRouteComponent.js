import {getMountedInstances} from "./exposeMetrics";

export default function findRouteComponent() {
    const routes = getMountedInstances();
    const component = routes && routes.length > 0 && routes[routes.length - 1];
    return component;
}
