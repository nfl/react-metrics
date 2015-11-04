import React from "react";
import {PropTypes, exposeMetrics} from "react-metrics"; // eslint-disable-line import/named

@exposeMetrics
class ManualPageView extends React.Component {
    static contextTypes = {
        metrics: PropTypes.metrics
    }

    static propTypes = {
        appName: React.PropTypes.string
    }

    componentDidMount() {
        const {appName} = this.props;
        this.context.metrics.pageView({appName});
    }

    static willTrackPageView() {
        return false;
    }

    render() {
        return <h1>Manual Page View Example</h1>;
    }
}

export default ManualPageView;
