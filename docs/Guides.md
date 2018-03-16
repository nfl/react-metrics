## <a id='location'></a>[`location` Prop](#location)

A location prop is a subset of [history](https://github.com/rackt/history)'s [Location](https://github.com/rackt/history/blob/master/docs/Location.md).

```
pathname      The pathname portion of the URL, without query string
search        The query string portion of the URL, including the ?
state         An object of data tied to this location
query         A parsed object from query string
```

## <a id='params'></a>[`params`](#params)

`params` is an object of key/value pairs that were parsed out of the route's dynamic segment definition when available.
For example, when your routing library allows you to define one of the routes as `/user/:id`, and the actual `pathname` for the URL is `/user/123`, the `params` will be `{user: 123}`.

## <a id='routeState'></a>[`routeState`](#routeState)

`routeState` is an object which represents the current route state. It's essentially [`location`](#location) + [[`params`](#params)] and expected to change every time the URL changes.

`react-metrics` will try to expose [`params`](#params) to `routeState` only when it's passed as props to metrics wrapper.

## <a id='vendor'></a>[`vendor`](#vendor)

A `vendor` option is an object member of `vendors` option array in configuration object and supports 2 properties:

### `name`

A name of the vendor service to be returned as part of tracking response if defined. This will override the `name` property defined in `api`.

### `api`

An object, a class instance or a function which returns an object which exposes tracking APIs. You don't have to define `pageView` or `track` api, but keep in mind that `react-metrics` will assume those methods to exist for auto page view and declarative tracking and throws when not available.
You can define `name` property in your api, which will be returned as part of tracking response.

Custom `api` methods can take 3 arguments:

```
someMethod(eventType?: string, eventData?: Object, shouldMergeWithDefaultObject?: boolean)
```

Example:

```javascript
{
    vendors: [{
        name: "Your Service Name Override",
        api: {
            name: "Your Service Name",
            pageView() {
                // your logic here
            },
            track() {
                // your logic here
            },
            someMethod() {
                // your logic here
            }
        }
    }]
}

```

## <a id='routeChangeDetection'></a>[Route Change Detection](#routeChangeDetection)

`react-metrics` assumes that `metrics` wrapper receives [`location`](#location) props which is updated when the URL route changes to trigger page view call.

Here are the implementation guides per use cases:

| Routing Solution| Action required | Example |
| ------------- | ------------- | ------------- |
| [React Router](https://github.com/rackt/react-router) | Nothing! | [Here](/examples/react-router) |
| Using [history](https://github.com/rackt/history)  | Pass its [Location](https://github.com/rackt/history/blob/master/docs/Location.md) object to prop to metrics wrapper, optionally construct and pass [`params`](#params) prop | [Here](/examples/no-router-lib) |
| Other solutions  | Construct [`location`](#location) compliant prop and optionally [`params`](#params) prop to pass to metrics wrapper | [Here](/examples/cerebral) |

**You can override this [logic](/src/react/getRouteState.js) by supplying `getRouteState` function as a [configuration option](/docs/api/ReactMetrics.md#config).**

## <a id='routeHandlerDetection'></a>[How react-metrics detects your component as route handler?](#routeHandlerDetection)

When you wrap your component with [`exposeMetrics`](/docs/api/ReactMetrics.md#exposeMetrics) to make `willTrackPageView` available, `react-metrics` will register your component in its registry.

When [the route changes](#routeChangeDetection), it assumes the last registered component as the route handler component. A route handler component is the one which takes care of rendering the view for the corresponding route URL.

For this assumption to work correctly, it's important to make sure your component gets mounted/unmounted as expected when a route changes.

**You can override this [logic](/src/react/findRouteComponent.js) by supplying `findRouteComponent` function as a [configuration option](/docs/api/ReactMetrics.md#config).**
