/* eslint-disable react/no-multi-comp */
import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import {metrics} from "react-metrics"; // eslint-disable-line import/named
import MetricsConfig from "./metrics.config";
import getRouteState from "./getRouteState";
import Home from "./components/home";
import AsyncPageView from "./components/async-page-view";
import ManualPageView from "./components/manual-page-view";
import User from "./components/user";
import {Container, Decorator as Cerebral} from "cerebral-react";
import controller from "./controller";
import Router from "cerebral-router";

import homeOpened from "./signals/homeOpened.js";
import asyncOpened from "./signals/asyncOpened.js";
import manualOpened from "./signals/manualOpened.js";
import userOpened from "./signals/userOpened.js";
import invalidUrlRouted from "./signals/invalidUrlRouted.js";

@Cerebral({
    appName: ["appName"],
    route: ["route"],
    title: ["title"],
    page: ["page"]
})
@metrics(MetricsConfig, {
    getRouteState
})
class App extends Component {
    static displayName = controller.get("appName")

    static propTypes = {
        page: PropTypes.string
    }

    onClick(signal, event) {
        event.preventDefault();
        signal();
    }

    renderPage() {
        switch (this.props.page) {
            case "home":
                return <Home {...this.props}/>;
            case "async":
                return <AsyncPageView {...this.props}/>;
            case "manual":
                return <ManualPageView {...this.props}/>;
            case "user":
                return <User {...this.props}/>;
            case "invalid":
                return "This is not a valid url!";
        }
    }

    render() {
        return (
            <div>
                <ul>
                    <li><a href="#/">Home</a></li>
                    <li><a href="#/async">Async Page View Track</a></li>
                    <li><a href="#/async?abc=def">Async Page View Track with query param</a></li>
                    <li><a href="#/manual">Manual Page View Track</a></li>
                    <li><a href="#/user/123">Page View Track with params</a></li>
                </ul>
                {this.renderPage()}
            </div>
        );
    }
}

controller.signal("homeOpened", homeOpened);
controller.signal("asyncOpened", asyncOpened);
controller.signal("manualOpened", manualOpened);
controller.signal("userOpened", userOpened);
controller.signal("invalidUrlRouted", invalidUrlRouted);

Router(controller, {
    "/": "homeOpened",
    "/async": "asyncOpened",
    "/manual": "manualOpened",
    "/user/:id": "userOpened",
    "*": "invalidUrlRouted"
}, {
    baseUrl: "/cerebral/basic/index.html",
    onlyHash: true
}).trigger();

ReactDOM.render((
    <Container controller={controller} app={App}/>
), document.getElementById("example"));
