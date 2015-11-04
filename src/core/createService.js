/* eslint-disable no-empty */
import ActionTypes from "./ActionTypes";
import {aggregateApisByType} from "./utils/extractApis";

const noop = function () {};

function isService(obj) {
    const functionProps = aggregateApisByType(obj);
    return functionProps.length > 0;
}

export const defaultService = {
    [ActionTypes.PAGE_VIEW]: noop,
    [ActionTypes.TRACK]: noop
};

export default function createService(options = {}) {
    const {api} = options;
    let instance = defaultService;
    function instantiate() {
        const ClassType = api;
        return new ClassType(options);
    }
    if (typeof api === "function") {
        let inst;
        try {
            inst = api(options);
        } catch (err) {
        } finally {
            if (!inst || !isService(inst)) {
                inst = instantiate();
            }
            if (isService(inst)) {
                instance = inst;
            }
        }
    } else if (api && typeof api === "object" && isService(api)) {
        instance = api;
    }
    const name = options.name || instance.name;
    return {name, apis: instance};
}
