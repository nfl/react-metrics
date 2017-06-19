const EXCLUDES = ["constructor"].concat(
    Object.getOwnPropertyNames(Object.getPrototypeOf({}))
);

export function filterKeysByType(obj, total = [], type = "function") {
    return Object.getOwnPropertyNames(obj).filter(key => {
        return (
            total.indexOf(key) === -1 &&
            EXCLUDES.indexOf(key) === -1 &&
            key.indexOf("_") !== 0 && // consider it's private
            obj.hasOwnProperty(key) &&
            typeof obj[key] === type
        );
    });
}

export function aggregateApisByType(obj, total = []) {
    const keys = [];
    while (obj !== null) {
        // eslint-disable-line no-eq-null
        const arr = filterKeysByType(obj, total);
        keys.push(...arr);
        obj = Object.getPrototypeOf(obj);
    }
    return keys;
}

// extracts lists of methods from each service object.
export default function extractApis(services) {
    services = Array.isArray(services) ? services : [services];
    const apis = services.reduce((total, service) => {
        const obj = service.constructor === Object
            ? service
            : Object.getPrototypeOf(service);
        const keys = aggregateApisByType(obj, total);
        total.push(...keys);
        return total;
    }, []);

    return apis;
}
