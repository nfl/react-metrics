<img src="http://static.nfl.com/static/content/public/static/img/logos/nfl-engineering-light.svg" width="300" />
# React Metrics
[![npm package](https://img.shields.io/npm/v/react-metrics.svg?style=flat-square)](https://www.npmjs.org/package/react-metrics)
[![build status](https://img.shields.io/travis/nfl/react-metrics/master.svg?style=flat-square)](https://travis-ci.org/nfl/react-metrics)
[![dependency status](https://img.shields.io/david/nfl/react-metrics.svg?style=flat-square)](https://david-dm.org/nfl/react-metrics)
[![codecov.io](https://img.shields.io/codecov/c/github/nfl/react-metrics/master.svg?style=flat-square)](https://codecov.io/github/nfl/react-metrics?branch=master)

An analytics module for [React](https://github.com/facebook/react).

## Requirements

 * React 0.14+

## Browser Requirements

 * IE10+

## Features

 * Unobtrusive feature injection through a root application component.
 * Supports page view tracking.
 * Supports both imperative and declarative custom link tracking.
 * Provides a custom event tracking API.
 * Supports multiple simultaneous analytics vendor tracking.


## Installation

```
$ npm install --save react-metrics
```

React Metrics depends on [Promise](https://promisesaplus.com/) to be available in browser. If your application support the browser which doesn't support Promise, please include the polyfill.

## Getting Started

### 1. Configure Metrics

Refer to the [docs](/docs/) for more information on [configuration](/docs/api/ReactMetrics.md#config).

```javascript
// Application.js
import {metrics} from "react-metrics";

const config = {
    vendors: [{
        name: "Google Analytics",
        api: new GoogleAnalytics({
            trackingId: "UA-********-*"
        })
    }],
    pageViewEvent: "pageLoad",
    pageDefaults: () => {
        return {
            siteName: "My Web Site",
            ...
        };
    }
}
```

### 2. Wrap Application Level Component

Compose your top level application component with `metrics` in order to provide `metrics` to all components and automatically enable page view tracking.

```javascript
// Application.js
class Application extends React.Component {
    render() {
        return (
            {this.props.children}
        );
    }
}
export default metrics(config)(Application);
```

Alternatively, if your development environment supports ES7, use the [@decorator](http://babeljs.io/docs/plugins/syntax-decorators/) syntax instead:

```javascript
// Application.js
@metrics(config)
class Application extends React.Component {
    render() {
        return (
            {this.props.children}
        );
    }
}
```

Your application will now automatically trigger page view tracking.

### 3. Add Custom Link Tracking

a. Use `data-` attributes to enable custom link tracking on your DOM elements.

```javascript
// PaginationComponent.js
class PaginationComponent extends React.Component {
    render() {
        const {commentId, totalPage, currentPage} = this.props;
        return (
            <ul>
                <li className={currentPage > 0 ? "active" : ""}>
                    <a
                        href="#"
                        data-metrics-event-name="commentPageClick"
                        data-metrics-comment-id={commentId}
                        data-metrics-page-num={currentPage - 1}>
                        Back
                    </a>
                </li>
                <li>...</li>
                <li className={currentPage < totalPage - 1 ? "active" : ""}>
                    <a
                        href="#"
                        data-metrics-event-name="commentPageClick"
                        data-metrics-comment-id={commentId}
                        data-metrics-page-num={currentPage + 1}>
                        Next
                    </a>
                </li>
            </ul>
        );
    }
}
```

b. Use [`MetricsElement`](/docs/api/ReactMetrics.md#MetricsElement) for custom link tracking on a nested DOM element.

Please see [`MetricsElement`](/docs/api/ReactMetrics.md#MetricsElement) for more use cases.

```javascript
import {MetricsElement} from "react-metrics";
// PaginationComponent.js
class PaginationComponent extends React.Component {
    render() {
        const {commentId, totalPage, currentPage} = this.props;
        return (
            <ul>
                <li className={currentPage > 0 ? "active" : ""}>
                    <MetricsElement
                        element="a"
                        href="#"
                        data-metrics-event-name="commentPageClick"
                        data-metrics-comment-id={commentId}
                        data-metrics-page-num={currentPage - 1}>
                        <span className="button">Back</span>
                    </MetricsElement>
                </li>
                <li>...</li>
                <li className={currentPage < totalPage - 1 ? "active" : ""}>
                    <MetricsElement
                        element="a"
                        href="#"
                        data-metrics-event-name="commentPageClick"
                        data-metrics-comment-id={commentId}
                        data-metrics-page-num={currentPage + 1}>
                        <span className="button">Next</span>
                    </MetricsElement>
                </li>
            </ul>
        );
    }
}
```

### 4. Analytics Vendor Implementations

`react-metrics` does not automatically supply any vendor analytics. You need to integrate with an analytics vendor to actually track something for reporting.
Refer to [Vendor Examples](/examples/vendors) for Omniture, Google Analytics and other implementations.

Also check out the awesome [segmentio library](https://github.com/segmentio/analytics.js) which provides a lot of third party analytics vendors.

## Advanced Usage

### Override Default Page View Tracking

Use the `@exposeMetrics` decorator and `willTrackPageView()` methods on a route-handling component to override the default page view tracking behavior and `pageDefaults` data.

1. Example: disable automatic page view tracking and trigger page view tracking manually.

```javascript
// PageComponent.js
// Must be a "route handling" component: <Route path="my-page" component={PageComponent}/>

import {exposeMetrics, PropTypes} from "react-metrics";

@exposeMetrics
class PageComponent extends React.Component {
    static contextTypes = {
        metrics: PropTypes.metrics
    }
    static willTrackPageView() {
        // first, suppress the automatic call.
        return false;
    }
    componentDidMount() {
        const {value1, value2} = this.props;
        this.context.metrics.pageView({value1, value2});
    }
    render () {
        ...
    }
}
```

2. Example: add custom data to automatic page view tracking.

```javascript
// PageComponent.js "route-handler
// A route handling component: <Route path="my-page" component={PageComponent}/>

import {exposeMetrics} from "react-metrics";

@exposeMetrics
class PageComponent extends React.Component {
    static willTrackPageView(routeState) {
        // return a promise that resolves to custom data.
        return yourPromise.then(data => {
            // data gets merged with `pageDefaults` object
            return data;
        });
    }
    render () {
        ...
    }
}
```

### Imperative Custom Event Tracking

Use `this.context.metrics.track()` to trigger custom event tracking as an alternative to [declarative custom link tracking](/docs/GettingStarted.md#declarative-vs-imperative-tracking).
Define `metrics` as a `contextType` in your component and trigger custom track events using `metrics.track()`.

```javascript
import {PropTypes} from "react-metrics";

class YourComponent extends React.Component {
    static contextTypes = {
        metrics: PropTypes.metrics
    }

    onSomethingUpdated(value) {
        this.context.metrics.track("customEventName", {value});
    }

    render() {
        ...
    }
}
```

### Metrics API Outside a React Component

`react-metrics` provides a low level factory API; this is convenient for exposing an instance of the `metrics` API outside of a React component.
Use `createMetrics` to create a `metrics` instance and expose the `metrics.api`.

```javascript
// creating middleware for Redux

import {createMetrics} from "react-metrics";

const metrics = createMetrics(config);

export default function metricsMiddleware() {
    return next => action => {
        const returnValue = next(action);
        switch (action.type) {
            case ActionTypes.ROUTE_CHANGE:
                const {location} = action;
                const paths = location.pathname.substr(1).split("/");
                const routeState = location;
                metrics.setRouteState(routeState);
                metrics.api.pageView({
                    category: !paths[0] ? "landing" : paths[0]
                });
        }
        return returnValue;
    };
}
```

## API, Examples, and Documentation

* [API](/docs/api/) Review the `metrics` API
* [Getting Started](/docs/GettingStarted.md) A more detailed Getting Started Guide
* [Vendor Examples](/examples/vendors) Omniture, Google Analytics, and other analytics vendor examples.
* [Docs](/docs/) Guides, API, and examples.


## To run examples:

1. Clone this repo
2. Run `npm install`
3. Run `npm run examples`
4. Point your browser to http://localhost:8080

## Contributing to this project

Please take a moment to review the [guidelines for contributing](CONTRIBUTING.md).

* [Pull requests](CONTRIBUTING.md#pull-requests)
* [Development Process](CONTRIBUTING.md#development)

## License

MIT
