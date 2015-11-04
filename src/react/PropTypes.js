import {PropTypes} from "react";

const {shape, object, string} = PropTypes;

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
