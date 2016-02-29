/* eslint-disable react/no-multi-comp */
import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, Link, IndexLink, hashHistory} from "react-router";
import {metrics} from "react-metrics"; // eslint-disable-line import/named
import MetricsConfig from "./metrics.config";
import Home from "./home";
import AsyncPageView from "./async-page-view";
import ManualPageView from "./manual-page-view";
import User from "./user";

class App extends Component {
    static displayName = "My Application";

    static propTypes = {
        children: PropTypes.node
    };

    render() {
        return (
            <div>
                <ul>
                    <li><IndexLink to="/">Home</IndexLink></li>
                    <li><Link to="/async">Async Page View Track</Link></li>
                    <li><Link to={{pathname: "/async", query: {param: "abc"}}}>Async Page View Track with query param</Link></li>
                    <li><Link to="/manual">Manual Page View Track</Link></li>
                    <li><Link to="/user/123">Page View Track with params</Link></li>
                </ul>
                {this.props.children && React.cloneElement(this.props.children, {
                    appName: App.displayName
                })}
            </div>
        );
    }
}
const DecoratedApp = metrics(MetricsConfig)(App);

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
            <Route path="async" component={AsyncPageView}/>
            <Route path="manual" component={ManualPageView}/>
            <Route path="user/:id" component={User}/>
            <Route path="*" component={NotFound}/>
        </Route>
    </Router>
), document.getElementById("example"));
