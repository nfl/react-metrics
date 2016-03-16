/* eslint-disable react/no-multi-comp */
import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import {metrics} from "react-metrics"; // eslint-disable-line import/no-unresolved
import MetricsConfig from "./metrics.config";
import Home from "./home";
import Page from "./page";
import createHistory from "history/lib/createHashHistory";

@metrics(MetricsConfig)
class App extends Component {
    static propTypes = {
        history: PropTypes.object,
        children: PropTypes.node
    };

    render() {
        const createHref = this.props.history.createHref;
        return (
            <div>
                <ul>
                    <li><a href={createHref("/")}>Home</a></li>
                    <li><a href={createHref("/page/A")}>Page A</a></li>
                    <li><a href={createHref("/page/B")}>Page B</a></li>
                </ul>
                {this.props.children && React.cloneElement(this.props.children, this.props)}
            </div>
        );
    }
}

class AppContainer extends Component {
    constructor(props) {
        super(props);
        this.history = createHistory();
        this.routes = {
            "/": {component: Home},
            "/page/A": {component: Page, params: {id: "A"}},
            "/page/B": {component: Page, params: {id: "B"}}
        };
        this.state = {
            routeComponent: this.routes["/"].component
        };
    }

    componentWillMount() {
        this.unlisten = this.history.listen(location => {
            const route = this.routes[location.pathname] || this.routes["/"];
            const {component: routeComponent, params} = route;
            this.setState({routeComponent, location, params});
        });
    }

    componentWillUnmount() {
        this.unlisten();
    }

    render() {
        return (
            <App history={this.history}
                 location={this.state.location}
                 params={this.state.params}
            >
                {React.createElement(this.state.routeComponent)}
            </App>
        );
    }
}

ReactDOM.render((
    <AppContainer/>
), document.getElementById("example"));
