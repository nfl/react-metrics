/* eslint-disable react/no-multi-comp */
import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, Link, IndexLink, useRouterHistory} from "react-router";
import createHistory from "history/lib/createHashHistory";
import {createStore, applyMiddleware} from "redux";
import {Provider, connect} from "react-redux";
import counter from "./counter";
import {inclement, declement, routeChange} from "./action";
import metricsMiddleware from "./metricsMiddleware";

const reducer = counter;
const createStoreWithMiddleware = applyMiddleware(
    metricsMiddleware
)(createStore);
const store = createStoreWithMiddleware(reducer, {
    counterA: 0,
    counterB: 0
});


let prevLocation = {};
const history = createHistory();
history.listen(location => {
    if (location.pathname !== prevLocation.pathname) {
        store.dispatch(routeChange(location));
        prevLocation = location;
    }
});
const appHistory = useRouterHistory(createHistory)();

@connect(
    state => ({
        counterA: state.counterA,
        counterB: state.counterB
    })
)
class Application extends Component {
    static propTypes = {
        children: PropTypes.node,
        dispatch: PropTypes.func.isRequired
    };
    onInclementClick(id) {
        this.props.dispatch(inclement(id));
    }
    onDeclementClick(id) {
        this.props.dispatch(declement(id));
    }
    render() {
        return (
            <div>
                <ul>
                    <li><IndexLink to="/">Home</IndexLink></li>
                    <li><Link to="/page/A">Page A</Link></li>
                    <li><Link to="/page/B">Page B</Link></li>
                </ul>
                {this.props.children && React.cloneElement(this.props.children, {
                    ...this.props,
                    onInclementClick: this.onInclementClick.bind(this),
                    onDeclementClick: this.onDeclementClick.bind(this)
                })}
            </div>
        );
    }
}

class Home extends Component {
    render() {
        return (
            <div><h1>Home</h1></div>
        );
    }
}

class Page extends Component {
    static propTypes = {
        params: PropTypes.object,
        onInclementClick: PropTypes.func,
        onDeclementClick: PropTypes.func,
        counterA: PropTypes.number,
        counterB: PropTypes.number
    };

    render() {
        const {params, counterA, counterB, onInclementClick, onDeclementClick} = this.props;
        return (
            <div>
                <h1>Page {params.id}</h1>
                <div>counter A: {counterA}</div>
                <div>counter B: {counterB}</div>
                <div>
                    <button onClick={() => onInclementClick(params.id)}>Inclement</button>
                    <button onClick={() => onDeclementClick(params.id)}>Declement</button>
                </div>
            </div>
        );
    }
}

ReactDOM.render((
    <div>
        <Provider store={store}>
            <Router history={appHistory}>
                <Route path="/" component={Application}>
                    <IndexRoute component={Home}/>
                    <Route path="/page/:id" component={Page}/>
                </Route>
            </Router>
        </Provider>
    </div>
), document.getElementById("example"));
