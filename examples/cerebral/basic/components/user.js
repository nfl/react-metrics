import React, {PropTypes} from "react";
import {exposeMetrics} from "react-metrics"; // eslint-disable-line import/named

@exposeMetrics
class User extends React.Component {
    static propTypes = {
        params: PropTypes.object,
        route: PropTypes.object
    }

    static willTrackPageView(routeState) {
        return routeState.params;
    }

    render() {
        const {route} = this.props;
        const id = route && route.params && route.params.id;
        return (
            <div className="User">
                <h1>User id: {id}</h1>
            </div>
        );
    }
}
export default User;
