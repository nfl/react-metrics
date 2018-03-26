/* eslint-disable react/no-multi-comp, max-nested-callbacks, react/prop-types, padded-blocks */
import React from "react";
import ReactDOM from "react-dom";
import {createMemoryHistory, Router, Route, useRouterHistory} from "react-router";
import execSteps from "../execSteps";
import metrics from "../../src/react/metrics";
import exposeMetrics from "../../src/react/exposeMetrics";
import MetricsConfig from "../metrics.config";
import metricsMock from "../metricsMock";


describe("willTrackPageView", () => {
    let node;

    beforeEach(() => {
        node = document.createElement("div");
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(node);
    });

    it("is called after 'componentDidMount' and 'componentDidUpdate'", done => {
        let componentWillMountCalled = false;
        let componentDidMountCalled = false;
        let componentWillReceivePropsCalled = false;
        let componentDidUpdateCalled = false;
        let willTrackPageViewCount = 0;

        @metrics(MetricsConfig)
        class Application extends React.Component {
            static displayName = "Application";

            render() {
                return <div><h1>Application</h1>{this.props.children}</div>;
            }
        }

        class Page extends React.Component {
            static displayName = "Page";

            render() {
                return <div><h2>Page</h2>{this.props.children}</div>;
            }
        }

        @exposeMetrics class Content extends React.Component {
            static displayName = "Content";

            static willTrackPageView() {
                if (willTrackPageViewCount === 0) {
                    expect(componentWillMountCalled).to.equal(true);
                    expect(componentDidMountCalled).to.equal(true);
                } else if (willTrackPageViewCount === 1) {
                    expect(componentWillReceivePropsCalled).to.equal(true);
                    expect(componentDidUpdateCalled).to.equal(true);
                    done();
                }
                willTrackPageViewCount++;
            }

            componentWillMount() {
                componentWillMountCalled = true;
            }

            componentDidMount() {
                componentDidMountCalled = true;
            }

            componentWillReceiveProps() {
                componentWillReceivePropsCalled = true;
            }

            componentDidUpdate() {
                componentDidUpdateCalled = true;
            }

            render() {
                return <h3>Content</h3>;
            }
        }

        const history = useRouterHistory(createMemoryHistory);

        ReactDOM.render(
            <Router history={history}>
                <Route component={Application} path="/">
                    <Route component={Page} path="page">
                        <Route component={Content} path=":content" />
                    </Route>
                </Route>
            </Router>,
            node,
            () => {
                history.push("/page/content2");
            }
        );
    });

    it("cancels page view tracking when returns 'false'.", done => {
        @metrics(MetricsConfig)
        @exposeMetrics
        class Application extends React.Component {
            static displayName = "Application";

            static willTrackPageView() {
                return false;
            }

            render() {
                return <div>{this.props.children}</div>;
            }
        }

        const mock = sinon.mock(metricsMock.api);
        const pageView = sinon.stub(
            Application.prototype,
            "_getMetrics",
            () => {
                return metricsMock;
            }
        );
        mock.expects("pageView").never();

        const history = useRouterHistory(createMemoryHistory)({
          basename: "/"
        });

        ReactDOM.render(
            <Router history={history}>
                <Route component={Application} path="/" />
            </Router>,
            node,
            () => {
                mock.verify();
                mock.restore();
                pageView.restore();
                done();
            }
        );
    });

    it("can accpets object", done => {
        @metrics(MetricsConfig)
        @exposeMetrics
        class Application extends React.Component {
            static displayName = "Application";

            static willTrackPageView() {
                return {
                    prop1: "value1"
                };
            }

            render() {
                return <div>{this.props.children}</div>;
            }
        }

        const pageView = sinon.stub(
            Application.prototype,
            "_getMetrics",
            () => {
                return {
                    ...metricsMock,
                    api: {
                        pageView(...args) {
                            expect(typeof args[0]).to.be.equal("object");
                            pageView.restore();
                            done();
                        }
                    }
                };
            }
        );

        const history = useRouterHistory(createMemoryHistory)({
          basename: "/"
        });

        ReactDOM.render(
            <Router history={history}>
                <Route component={Application} path="/" />
            </Router>,
            node
        );
    });

    it("receives 'routeState' object with expected props and values", done => {
        const state = {isModal: false};

        @metrics(MetricsConfig)
        class Application extends React.Component {
            static displayName = "Application";

            render() {
                return <div>{this.props.children}</div>;
            }
        }

        @exposeMetrics class Page extends React.Component {
            static displayName = "Page";

            static willTrackPageView(routeState) {
                expect(routeState.pathname).to.equal("page/123");
                expect(routeState.search).to.equal("?param1=value1");
                expect(routeState.hash).to.equal("");
                expect(JSON.stringify(routeState.state)).to.equal(
                    JSON.stringify(state)
                );
                expect(JSON.stringify(routeState.params)).to.equal(
                    JSON.stringify({id: "123"})
                );
                done();
                return true;
            }

            render() {
                return <div><h2>Page</h2>{this.props.children}</div>;
            }
        }

        const history = useRouterHistory(createMemoryHistory)({
          basename: "/"
        });

        ReactDOM.render(
            <Router history={history}>
                <Route component={Application} path="/">
                    <Route component={Page} path="/page/:id" />
                </Route>
            </Router>,
            node,
            () => {
                history.push({
                    pathname: "/page/123",
                    search: "?param1=value1",
                    state
                });
            }
        );
    });
});
