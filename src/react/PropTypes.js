import {shape, object, string} from "prop-types";

export const metrics = object;

export const location = shape({
    pathname: string.isRequired,
    search: string.isRequired,
    query: object,
    state: object
});

export default {
    metrics,
    location
};
