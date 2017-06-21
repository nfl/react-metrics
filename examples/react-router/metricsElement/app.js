/* eslint-disable react/no-multi-comp */
import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import {
    Router,
    Route,
    IndexRoute,
    Link,
    IndexLink,
    hashHistory
} from "react-router";
import {metrics, MetricsElement} from "react-metrics"; // eslint-disable-line import/no-unresolved
import MetricsConfig from "./metrics.config";
import Home from "./home";
import Page from "./page";

class App extends Component {
    static displayName = "My Application";

    static propTypes = {
        children: PropTypes.node
    };

    render() {
        const link = (
            <Link
                data-tracking-event-name="linkClick"
                data-tracking-value="A"
                to="/page/A"
            >
                <span>Page A</span>
            </Link>
        );
        return (
            <div>
                <ul>
                    <li>
                        <MetricsElement>
                            <IndexLink
                                data-tracking-event-name="linkClick"
                                to="/"
                            >
                                <span>Home</span>
                            </IndexLink>
                        </MetricsElement>
                    </li>
                    <li>
                        <MetricsElement element={link}>
                            <span>This span won't render</span>
                        </MetricsElement>
                    </li>
                    <li>
                        <MetricsElement
                            data-tracking-event-name="linkClick"
                            data-tracking-value="B"
                            element={Link}
                            to="/page/B"
                        >
                            <span>Page B</span>
                        </MetricsElement>
                    </li>
                </ul>
                {this.props.children &&
                    React.cloneElement(this.props.children, {
                        appName: App.displayName
                    })}
            </div>
        );
    }
}
const DecoratedApp = metrics(MetricsConfig, {
    useTrackBinding: false,
    attributePrefix: "data-tracking"
})(App);

class NotFound extends Component {
    render() {
        return <h1>404!</h1>;
    }
}

ReactDOM.render(
    <Router history={hashHistory}>
        <Route component={DecoratedApp} path="/">
            <IndexRoute component={Home} />
            <Route component={Page} path="page/:id" />
            <Route component={NotFound} path="*" />
        </Route>
    </Router>,
    document.getElementById("example")
);
