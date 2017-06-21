import React from "react";
import PropTypes from "prop-types";
import {exposeMetrics} from "react-metrics"; // eslint-disable-line import/no-unresolved

@exposeMetrics class User extends React.Component {
    static propTypes = {
        params: PropTypes.object
    };

    static willTrackPageView(routeState) {
        return routeState.params;
    }

    render() {
        const {id} = this.props.params;
        return (
            <div className="User">
                <h1>User id: {id}</h1>
            </div>
        );
    }
}
export default User;
