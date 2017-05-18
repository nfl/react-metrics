import PropTypes from "prop-types";

export const metrics = PropTypes.object;

export const location = PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired,
    query: PropTypes.object,
    state: PropTypes.object
});

export default {
    metrics,
    location
};
