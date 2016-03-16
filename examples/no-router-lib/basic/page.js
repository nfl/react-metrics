import React, {PropTypes} from "react";
import {PropTypes as MetricsPropTypes} from "react-metrics"; // eslint-disable-line import/no-unresolved

class Page extends React.Component {
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
        this.context.metrics.track("trackClick", {page: params.id}, true/* this will merge page default metrics */);
    }

    render() {
        const {params} = this.props;
        return (
            <div>
                <h1>Page {params.id}</h1>
                <button onClick={this.onClick.bind(this)}>Manual Track</button>
                <button data-metrics-event-name="trackClick" data-metrics-page={params.id}>Declarative Track</button>
            </div>
        );
    }
}

export default Page;
