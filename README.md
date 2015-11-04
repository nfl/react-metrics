<img src="http://static.nfl.com/static/content/public/static/img/logos/nfl-engineering-light.svg" width="300" />
# React Metrics
[![npm package](https://img.shields.io/npm/v/react-metrics.svg?style=flat-square)](https://www.npmjs.org/package/react-metrics)
[![build status](https://img.shields.io/travis/nfl/react-metrics/master.svg?style=flat-square)](https://travis-ci.org/nfl/react-metrics)
[![dependency status](https://img.shields.io/david/nfl/react-metrics.svg?style=flat-square)](https://david-dm.org/nfl/react-metrics)

An analytics module for [React](https://github.com/facebook/react).

## Requirements

* React 0.14+

## Browser Requirements

* IE10+

## Install

```
$ npm install --save react-metrics
```

## Features

* Unobtrusive feature injection through a root application component.
* Supports basic industry standard tracking(page view, custom link) as well as custom tracking API.
* Supports both imperative and declarative custom link tracking.
* Supports multiple simultaneous analytics vendor tracking.

## Basic Usage

1. Wrap your Application Level component with `metrics` and pass options.

    ```javascript
    import {metrics} from "react-metrics";

    class Application extends React.Component {
        render() {
            return (
                {this.props.children}
            );
        }
    }
    export default metrics({
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
    })(Application);
    ```

    If your development environment supports ES7 decorator syntax,

    ```javascript
    import {metrics} from "react-metrics";

    @metrics({
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
    })
    class Application extends React.Component {
        render() {
            return (
                {this.props.children}
            );
        }
    }
    ```

    That's pretty much it! Now the page view will be automatically tracked for you.

2. Custom link tracking can be done by adding custom attribute to your html element you want to track.

    ```javascript
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

## Advanced Usage

If you want to include metrics data which is fetched from remote location upon the route change, you can define static `willTrackPageView` method in your route handler component which becomes available when you wrap your component with `exposeMetrics`. Then `willTrackPageView` gets called when auto page view is about to be fired.

```javascript
import {exposeMetrics} from "react-metrics";

@exposeMetrics
class PageComponent extends React.Component {
    static willTrackPageView(routeState) {
        return yourPromise.then(data => {
            // this gets merged with the data returned by `pageDefaults`
            return data;
        });
    }
    render () {
        ...
    }
}
```

You can make manual page view call per page basis at your timing by calling `this.context.metrics.pageView`

```javascript
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

[Declarative custom link tracking](/docs/GettingStarted.md#declarative-vs-imperative-tracking) may not always work for you. In that case, define metrics context as one of contextTypes in your component. This allows you to call `track` api you defined.

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

**React Metrics** exposes a low level factory API which lets you to create metrics instance where you can access its api directly.
It's convenient when you want to track metrics outside of your React component.

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

See more in the [Docs](/docs/).

## Note

**React Metrics** does not ship with any out-of-the-box vendor implementation. You need to integrate with your own vendor implementation to actually track something for reporting.

There are couple examples of vendor implementation in [examples](/examples/vendors). Also check out this awesome library which covers lots of third party analytics vendors [here](https://github.com/segmentio/analytics.js).

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
