/* eslint-disable react/no-multi-comp, max-nested-callbacks, react/prop-types, no-empty, padded-blocks */
import React from "react";
import ReactDOM from "react-dom";
import createHistory from "history/lib/createMemoryHistory";
import {Router, Route} from "react-router";
import metrics from "../../src/react/metrics";
import exposeMetrics, {
    getMountedInstances
} from "../../src/react/exposeMetrics";
import MetricsConfig from "../metrics.config";

describe("exposeMetrics", () => {
    let node;

    beforeEach(() => {
        node = document.createElement("div");
        MetricsConfig.autoTrackPageView = false;
    });

    afterEach(() => {
        try {
            ReactDOM.unmountComponentAtNode(node);
        } catch (err) {}
        MetricsConfig.autoTrackPageView = true;
    });

    it("should be named after wrapped component", () => {
        class Comp1 extends React.Component {
            static displayName = "Compo1";
            render() {
                return <h1>Page</h1>;
            }
        }

        let Metrics = exposeMetrics(Comp1);

        expect(Metrics.displayName).to.be.equal("Metrics(Compo1)");

        class Comp2 extends React.Component {
            render() {
                return <h1>Page</h1>;
            }
        }

        Metrics = exposeMetrics(Comp2);

        expect(Metrics.displayName).to.be.equal("Metrics(Comp2)");

        class Comp3 extends React.Component {
            render() {
                return <h1>Page</h1>;
            }
        }

        Metrics = exposeMetrics(Comp3);

        expect(Metrics.displayName).to.be.equal("Metrics(Comp3)");

        class Comp4 extends React.Component {
            static displayName = null;

            render() {
                return <h1>Page</h1>;
            }
        }

        Metrics = exposeMetrics(Comp4);

        expect(Metrics.displayName).to.contains("Metrics(");
    });

    it("should provide 'willTrackPageView' static method to route handler component", done => {
        @metrics(MetricsConfig)
        class Application extends React.Component {
            render() {
                return <div>{this.props.children}</div>;
            }
        }

        @exposeMetrics class Page extends React.Component {
            static displayName = "Page";

            static willTrackPageView() {
                expect(true).to.be.ok;
                done();
            }

            render() {
                return <h1>Page</h1>;
            }
        }

        ReactDOM.render(
            <Router history={createHistory("/")}>
                <Route component={Application} path="/">
                    <Route component={Page} path="/page/:id" />
                </Route>
            </Router>,
            node,
            function() {
                this.history.pushState(null, "/page/1");
            }
        );
    });

    it("should support partial application", done => {
        @metrics(MetricsConfig)
        class Application extends React.Component {
            render() {
                return <div>{this.props.children}</div>;
            }
        }

        @exposeMetrics()
        class Page extends React.Component {
            static willTrackPageView() {
                expect(true).to.be.ok;
                done();
            }

            render() {
                return <h1>Page</h1>;
            }
        }

        ReactDOM.render(
            <Router history={createHistory("/")}>
                <Route component={Application} path="/">
                    <Route component={Page} path="/page/:id" />
                </Route>
            </Router>,
            node,
            function() {
                this.history.pushState(null, "/page/1");
            }
        );
    });

    it("should register itself to a registry when mounting, unregister itself from a registry when unmounting", done => {
        @exposeMetrics class Application extends React.Component {
            render() {
                return <div>Application</div>;
            }
        }

        ReactDOM.render(<Application />, node, () => {
            const registry = getMountedInstances();
            expect(registry).to.have.length(1);
            ReactDOM.unmountComponentAtNode(node);
            expect(registry).to.have.length(0);
            done();
        });
    });
});
