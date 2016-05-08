/* eslint-disable react/no-multi-comp */
import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, Link, IndexLink, hashHistory} from "react-router";
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
        const link = (<Link to="/page/A" data-tracking-event-name="linkClick" data-tracking-value="A" ><span>Page A</span></Link>);
        return (
            <div>
                <ul>
                    <li><MetricsElement><IndexLink to="/" data-tracking-event-name="linkClick"><span>Home</span></IndexLink></MetricsElement></li>
                    <li><MetricsElement element={link}><span>This span won't render</span></MetricsElement></li>
                    <li><MetricsElement to="/page/B" data-tracking-event-name="linkClick" data-tracking-value="B" element={Link}><span>Page B</span></MetricsElement></li>
                </ul>
                {this.props.children && React.cloneElement(this.props.children, {
                    appName: App.displayName
                })}
            </div>
        );
    }
}
const DecoratedApp = metrics(MetricsConfig, {useTrackBinding: false, attributePrefix: "data-tracking"})(App);

class NotFound extends Component {
    render() {
        return (
            <h1>404!</h1>
        );
    }
}

ReactDOM.render((
    <Router history={hashHistory}>
        <Route path="/" component={DecoratedApp}>
            <IndexRoute component={Home}/>
            <Route path="page/:id" component={Page}/>
            <Route path="*" component={NotFound}/>
        </Route>
    </Router>
), document.getElementById("example"));
