## Getting Started

`react-metrics` expects [`location`](/docs/Guides.md#location) to be passed as prop. If you are using [React Router](https://github.com/rackt/react-router), you can skip to [Step 2](#step2).

### <a id='step1'></a>[Step 1](#step1)

Create a container component.

```javascript
class ApplicationContainer extends React.Component {
    // any logic to `setState` with `location` here.
    render() {
        return (
            <WrappedApplication {...this.state}/>
        );
    }
}
```

You can check out the example implementation [here](/examples/no-router-lib).

### <a id='step2'></a>[Step 2](#step2)

Wrap your Application component with [`metrics`](/docs/api/ReactMetrics.md#metrics) and pass [`config`](/docs/api/ReactMetrics.md#config).

```javascript
import {metrics} from "react-metrics";

class Application extends React.Component {
    render() {
        return (
            {this.props.children}
        );
    }
}

const WrappedApplication = metrics({
    vendors: [{
        name: "Google Analytics",
        api: new GoogleAnalytics({
            trackingId: ...
        })
    }],
    pageDefaults: ...
})(Application);
```

With ES7 decorator syntax,

```javascript
import {metrics} from "react-metrics";

@metrics({
    vendors: [{
        name: "Google Analytics",
        api: new GoogleAnalytics({
            trackingId: ...
        })
    }],
    pageDefaults: ...
})
class Application extends React.Component {
    render() {
        return (
            {this.props.children}
        );
    }
}
```

You can make configuration as shared module which is used across your applications.

```javascript
import metricsConfig from "shared-metrics-config";

@metrics(metricsConfig)
class Application extends React.Component {
    render() {
        return (
            {this.props.children}
        );
    }
}
```

Additionally you can pass `customParams` that applies to the specific application which gets merged into the metrics returned from `pageDefaults` option.

```javascript
import metricsConfig from "shared-metrics-config";

@metrics(Object.assign(metricsConfig, {
    customParams: {
        siteName: "My Site"
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

### <a id='step3'></a>[Step 3](#step3)

Render React Application.

```javascript
ReactDOM.render((
    <ApplicationContainer/>
), document.getElementById("root"));
```

If you are using [React Router](https://github.com/rackt/react-router),

```javascript
ReactDOM.render((
    <Router>
        <Route path="/" component={WrappedApplication}>
            ...
        <Route>
    </Router>
), document.getElementById("root"));
```

You can check out the example implementation using React Router [here](/examples/react-router).

### Page View Tracking

`react-metrics` will automatically detects route change and fires page view call for you.

Define the metrics you want to track across the pages in the `pageDefaults` option

Example:

```javascript
export default metrics({
    vendors: [{
        name: ...,
        api: {
            ...
        }
    }],
    pageViewEvent: "MyPageViewEvent",
    pageDefaults: (routeState) => {
        const paths = routeState.pathname.substr(1).split("/");
        return {
            category: !paths[0] ? "landing" : paths[0]
            timestamp: Date.now(),
            ...
        };
    }
})(Application);
```

`pageDefaults` gets called every time the page view tracking happens. It receives [`routeState`](/docs/Guides.md#routeState) which is convenient to send route specific information.

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

### Custom Link Tracking

#### Declarative vs Imperative tracking

There are 2 ways to call `track` api from your component.

1. **Declarative** by adding the attributes `data-metrics-event-name` and `data-metrics-*` to a html element. `data-metrics-event-name` is the event name used for the metrics vendor.

    **Note:** `YourComponent` need to be in the child tree of the wrapped component so that the click event is bubbled up to the wrapped component's root node.

    Example:

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

2. **Imperative** by calling the api explicitly. To do this, define `metrics` context as one of `contextTypes` in your child component. This allows you to call `track` api. You can pass either Object or Promise as a second argument. It's your responsibility to implement `track` api in your service, otherwise calling the api simply throws an error.

    Example:

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

### Using your metrics vendor

To send tracking to your metrics vendor, you can create your own service class with api methods.

```javascript
class YourApiClass {
    pageView(eventName, params) {
        // your page view tracking logic here.
    }
    track(eventName, params) {
        // your custom link tracking logic here.
    }
}
```

or just as a plain object

```javascript
const YourApiObject = {
    pageView: function (eventName, params) {
        // your page view tracking logic here.
    },
    track: function (eventName, params) {
        // your custom link tracking logic here.
    }
}
```

You don't have to return anything in your api, but if you do, it will be included as `response` in the tracking event payload.
`react-metrics` will determine the success of the request in the form of Promise, so if you don't return anything, which `react-metrics` receives as `undefined` and convert it to `Promise.resolve(undefined)`, the request will be treated as success.

If you need any initialization step which needs to happen before `pageView` or `track` is called, we recommend you use promise for lazy initialization.

Example:

```javascript
class YourApiClass {
    pageView(eventName, params) {
        return new Promise((resolve, reject) => {
            this.loadScript()
                .then(globalVendorObject => {
                    const result = globalVendorObject.track(eventName, params);
                    if (result) {
                        resolve({
                            eventName,
                            params
                        });
                    } else {
                        reject(new Error("tracking request failed"));
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
    track(eventName, params) {
        // your custom link tracking logic here.
    }
    loadScript() {
        return this._promise || (this._promise = new Promise((resolve, reject) => {
            if (window.globalVendorObject) {
                resolve(window.globalVendorObject);
            } else {
                const script = document.createElement("script");

                script.onload = () => {
                    resolve(window.globalVendorObject);
                };

                script.onerror = error => {
                    reject(error);
                };

                script.src = "//some.vendor.com/lib.js";
                document.head.appendChild(script);
            }
        }));
    }
}
```

More complete example [here](/examples/vendors/AdobeTagManager.js).

Then pass the class definition or an object to the `vendor.api`. You can also pass an instance of your service class if you want to pass some constructor arguments.
You can define the name of the service which will be included in the response for each tracking request in `vendor.name`.

```javascript
class Application extends React.Component {
    render() {
        return (
            <div>{this.props.children}</div>
        );
    }
}
export default metrics({
    vendors: [{
        name: "Your Metrics Service Name",
        api: new YourApiClass(options)
    }],
    pageDefaults: ...
})(Application);
```

### Tracking custom metrics

You can define any api method in your service and you can call it from context object.
Let's say if your service defines `setUser` method which stores user identity, or `videoMileStone` method to track video consumption

```javascript
const YourApiObject = {
    pageView: function (eventName, params) {
        ...
    },
    track: function (eventName, params) {
        ...
    },
    setUser: function (user) {
        // sends or store user information
    },
    videoMileStone: function(milestone) {
        // sends video consumption
    }
}
```

Then you can call them from your component.

```javascript
import {PropTypes} from "react-metrics";

class PageComponent extends React.Component {
    static contextTypes = {
        metrics: PropTypes.metrics
    }

    onSetUser(user) {
        this.context.metrics.setUser(user);
    }

    onVideoPlaybackTimeChange(time) {
        if (...) {
            ...
            this.context.metrics.videoMileStone({videoId, milestone, time});
        }
    }

    render () {
        ...
    }
}
```

### How about using metrics outside of React Component?

Yes, you can send metrics outside of React Component. Please see [here](/docs/api/ReactMetrics.md#createMetrics).
