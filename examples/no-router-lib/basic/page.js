import React from "react";
import PropTypes from "prop-types";

import {PropTypes as MetricsPropTypes} from "react-metrics"; // eslint-disable-line import/no-unresolved

class Page extends React.Component {
    constructor(...args) {
        super(...args);

        this.onClick = this.onClick.bind(this);
    }

    static contextTypes = {
        metrics: MetricsPropTypes.metrics,
        appState: PropTypes.any
    };

    static propTypes = {
        params: PropTypes.object
    };

    onClick() {
        this.context.metrics.user({
            username: "exampleuser"
        });
        const {params} = this.props;
        this.context.metrics.track(
            "trackClick",
            {page: params.id},
            true /* this will merge page default metrics */
        );
    }

    render() {
        const {params} = this.props;
        return (
            <div>
                <h1>Page {params.id}</h1>
                <button onClick={this.onClick}>Manual Track</button>
                <button
                    data-metrics-event-name="trackClick"
                    data-metrics-merge-pagedefaults="true"
                    data-metrics-page={params.id}
                >
                    Declarative Track
                </button>
            </div>
        );
    }
}

export default Page;
