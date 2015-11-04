/* eslint-disable react/no-multi-comp, max-nested-callbacks, react/prop-types, no-empty, padded-blocks */
import React from "react";
import ReactDOM from "react-dom";
import createHistory from "history/lib/createMemoryHistory";
import {Router, Route} from "react-router";
import execSteps from "../execSteps";
import ReactTestUtils from "react-addons-test-utils";
import metrics from "../../src/react/metrics";
import createMetrics, {isMetrics, Metrics} from "../../src/core/createMetrics";
import exposeMetrics, {clearMountedInstances} from "../../src/react/exposeMetrics";
import PropTypes from "../../src/react/PropTypes";
import metricsConfig from "../metrics.config";
import metricsMock from "../metricsMock";

export default () => {
    describe("metrics", () => {
        const defaultData = metricsConfig.pageDefaults();
        let pageDefaultsStub;
        let node;

        before(() => {
            pageDefaultsStub = sinon.stub(metricsConfig, "pageDefaults", (routeState) => {
                return Object.assign({}, defaultData, {
                    siteSection: routeState.pathname
                });
            });
        });

        after(() => {
            pageDefaultsStub.restore();
        });

        beforeEach(() => {
            node = document.createElement("div");
        });

        afterEach(() => {
            try {
                ReactDOM.unmountComponentAtNode(node);
            } catch (err) {}
        });

        it("should create 'metrics' instance", () => {
            @metrics(metricsConfig)
            class Application extends React.Component {
                render() {
                    return (<div></div>);
                }
            }

            const tree = ReactTestUtils.renderIntoDocument(
                <Application/>
            );

            const app = ReactTestUtils.findRenderedComponentWithType(tree, Application);
            expect(isMetrics(app._getMetrics())).to.be.true;

            tree.componentWillUnmount();
        });

        it("can inject 'metrics' instance", () => {
            const metricsInstance = createMetrics(metricsConfig);

            @metrics(metricsInstance)
            class Application extends React.Component {
                render() {
                    return (<div></div>);
                }
            }

            const tree = ReactTestUtils.renderIntoDocument(
                <Application/>
            );

            const app = ReactTestUtils.findRenderedComponentWithType(tree, Application);
            expect(app._getMetrics()).to.eql(metricsInstance);

            tree.componentWillUnmount();
        });

        it("throws when added to more than one component", done => {
            @metrics(metricsConfig)
            class Application extends React.Component {
                static displayName = "TestApplication";
                render() {
                    return (<div>{this.props.children}</div>);
                }
            }

            @metrics(metricsConfig)
            class Page extends React.Component {
                static displayName = "TestPage";
                render() {
                    return (<h1>Page</h1>);
                }
            }

            const execNextStep = function () {
                this.history.pushState(null, "/page");
                done();
            };

            expect(() => {
                ReactDOM.render((
                    <Router history={createHistory("/")} onUpdate={execNextStep}>
                        <Route path="/" component={Application}>
                            <Route path="/page" component={Page}/>
                        </Route>
                    </Router>
                ), node);
            }).to.throw("metrics should only be added once to the root level component. You have added to both TestApplication and TestPage");
        });

        it("should make 'metrics' context available", () => {
            const metricsContext = {};

            class Page extends React.Component {
                // context unit test fails w/o this, why??
                static contextTypes = {
                    metrics: PropTypes.metrics
                }
                render() {
                    return (<h1>Page</h1>);
                }
            }
            class Page2 extends React.Component {
                render() {
                    return (<h1>Page2</h1>);
                }
            }
            const TestPage = exposeMetrics(Page2);

            @metrics(metricsConfig)
            class Application extends React.Component {
                render() {
                    return (<div><Page/><TestPage/></div>);
                }
            }

            const stub = sinon.stub(Application.prototype, "_getMetrics", () => {
                return {
                    api: metricsContext
                };
            });

            const tree = ReactTestUtils.renderIntoDocument(
                <Application/>
            );

            const page = ReactTestUtils.findRenderedComponentWithType(tree, Page);
            expect(page.context.metrics).to.eql(metricsContext);

            const pageWithMetrics = ReactTestUtils.findRenderedComponentWithType(tree, TestPage);
            expect(pageWithMetrics.context.metrics).to.eql(metricsContext);

            stub.restore();
            tree.componentWillUnmount();
            clearMountedInstances();
        });

        it("should not auto track page view when 'autoTrackPageView' is set to false.", done => {
            @metrics(metricsConfig, {autoTrackPageView: false})
            class Application extends React.Component {
                static displayName = "Application"

                render() {
                    return (<div>{this.props.children}</div>);
                }
            }

            const pageView = sinon.stub(metricsMock.api, "pageView");
            const stub = sinon.stub(Application.prototype, "_getMetrics", () => {
                return metricsMock;
            });

            const steps = [
                function () {
                    expect(pageView.calledOnce).to.be.false;
                    this.history.pushState(null, "/page");
                },
                function () {
                    expect(pageView.calledOnce).to.be.true;
                    stub.restore();
                    pageView.restore();
                    done();
                }
            ];

            class Page extends React.Component {
                static displayName = "Page"

                static contextTypes = {
                    metrics: PropTypes.metrics.isRequired
                }

                componentDidMount() {
                    this.context.metrics.pageView();
                }

                static willTrackPageView() {
                    return false;
                }

                render() {
                    return (<div><h2>Page</h2></div>);
                }
            }

            const execNextStep = execSteps(steps, done);

            ReactDOM.render((
                <Router history={createHistory("/")} onUpdate={execNextStep}>
                    <Route path="/" component={Application}>
                        <Route path="/page" component={Page}/>
                    </Route>
                </Router>
            ), node, execNextStep);
        });

        it("should not use track binding when 'useTrackBinding' is set to false.", done => {
            const stub = sinon.stub(Metrics.prototype, "_handleClick");
            const metricsInstance = new Metrics(metricsConfig);
            @metrics(metricsInstance, {useTrackBinding: false})
            class Application extends React.Component {
                static displayName = "Application"
                componentDidMount() {
                    // make sure click happens after binding is done.
                    setTimeout(() => {
                        this.refs.link.click();
                        stub.should.have.callCount(0);
                        stub.reset();
                        done();
                    }, 0);
                }
                render() {
                    return (<div><a ref="link" href="#" data-metrics-event-name="myEvent"></a></div>);
                }
            }

            ReactDOM.render((
                <Application/>
            ), node);
        });

        it("throws when 'pageView' api is not defined in the config when auto page view tracking is triggered.", () => {
            @metrics({
                vendors: [{
                    name: "Test",
                    api: {
                        track() {
                            return {};
                        }
                    }
                }]
            })
            class Application extends React.Component {
                static displayName = "Application"

                render() {
                    return (<div><h2>Appication</h2></div>);
                }
            }

            expect(() => {
                ReactDOM.render((
                    <Router history={createHistory("/")}>
                        <Route path="/" component={Application}/>
                    </Router>
                ), node);
            }).to.throw(/'pageView' api needs to be defined/);
        });

        it("should be able to manually track page view with custom page view event name.", done => {
            const customPageViewRule = "customPageLoad";
            const customData = {
                pageName: "I",
                content: "J"
            };

            @metrics(metricsConfig)
            @exposeMetrics
            class Application extends React.Component {
                static displayName = "Application"

                static contextTypes = {
                    metrics: PropTypes.metrics.isRequired
                }

                componentDidMount() {
                    this.context.metrics.pageView(customPageViewRule, customData);
                }

                static willTrackPageView() {
                    return false;
                }

                render() {
                    return (<div></div>);
                }
            }

            const stub = sinon.stub(Application.prototype, "_getMetrics", () => {
                return {
                    api: {
                        pageView(...args) {
                            expect(args[0]).to.be.equal(customPageViewRule);
                            expect(args[1]).to.be.equal(customData);
                            stub.restore();
                            done();
                        }
                    }
                };
            });

            ReactDOM.render((
                <Application/>
            ), node);
        });

        it("should be able to manually track.", done => {
            const trackId = "customTrackId";
            const customData = {
                pageName: "I",
                content: "J"
            };

            @metrics(metricsConfig)
            @exposeMetrics
            class Application extends React.Component {
                static displayName = "Application"

                static contextTypes = {
                    metrics: PropTypes.metrics.isRequired
                }

                componentDidMount() {
                    this.context.metrics.track(trackId, customData);
                }

                static willTrackPageView() {
                    return false;
                }

                render() {
                    return (<div></div>);
                }
            }

            const stub = sinon.stub(Application.prototype, "_getMetrics", () => {
                return {
                    api: {
                        track(...args) {
                            expect(args[0]).to.be.equal(trackId);
                            expect(args[1]).to.be.equal(customData);
                            stub.restore();
                            done();
                        }
                    }
                };
            });

            ReactDOM.render((
                <Application/>
            ), node);
        });
    });
};
