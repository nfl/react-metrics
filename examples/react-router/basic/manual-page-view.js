import React from "react";
import exposeMetrics from "react-metrics"; // eslint-disable-line import/no-unresolved
import PropTypes from "prop-types";

@exposeMetrics class ManualPageView extends React.Component {
    static contextTypes = {
        metrics: PropTypes.metrics
    };

    static propTypes = {
        appName: PropTypes.string
    };

    static willTrackPageView() {
        return false;
    }

    componentDidMount() {
        const {appName} = this.props;
        this.context.metrics.pageView({appName});
    }

    render() {
        return <h1>Manual Page View Example</h1>;
    }
}

export default ManualPageView;
