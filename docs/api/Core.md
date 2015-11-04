## Metrics API References

### <a id='listen'></a>[`listen(callback)`](#listen)

Once a client calls this, metrics will call `callback` with tracking event including type of API, request params and response payload whenever tracking event occurs.
This will return a function to execute when unsubscribing.

Example:

```javascript
const metrics = createMetrics(config);
const unsubscribe = metrics.listen(callback);

// when you are done
unsubscribe();
```

### <a id='setRouteState'></a>[`setRouteState(routeState)`](#setRouteState)

Notifies metrics of route change and passes new route state object. Metrics will try to cancel any currently pending promise which is passed from the client(Not the one service api returns) when this is called.
The last set [`routeState`](/docs/Guides.md#routeState) will be passed to `pageDefaults` and `willTrackPageView` method, so if you need to access it from these methods, make sure you set it with the updated object.

#### Arguments

1. [`routeState`](/docs/Guides.md#routeState): An object which includes properties of route information.

```
pathname
search
state
query (optional)
params (optional)
```

### <a id='useTrackBinding'></a>[`useTrackBinding([rootElement], [attributePrefix])`](#useTrackBinding)

Calling this will enable declarative click tracking on element with custom tracking attributes.
This will return a function to execute when unsubscribing.

Example:

```javascript
const metrics = createMetrics(config);
const unsubscribe = metrics.useTrackBinding();

// when you are done using
unsubscribe();

// or passing false will have the same effect
metrics.useTrackBinding(false);
```

#### Arguments

1. rootElement (optional): An element which is used as event delegation root. If omitted, `document.body` will be used.
2. attributePrefix (optional): an attribute prefix which will override the default `data-metrics`.

### <a id='destroy'></a>[`destroy()`](#destroy)

Unsubscribe all listeners inside metrics instance.

### <a id='api'></a>[`api`](#api)

A read-only object which exposes all APIs defined in your [`vendors`](/docs/Guides.md#vendor) configuration.
