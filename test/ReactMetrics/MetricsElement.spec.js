/* eslint-disable react/no-multi-comp, max-nested-callbacks, react/prop-types, no-empty, padded-blocks */
import React, {PropTypes} from "react";
import ReactDOM from "react-dom";
import metrics from "../../src/react/metrics";
import MetricsElement from "../../src/react/MetricsElement";
import MetricsConfig from "../metrics.config";
import metricsMock from "../metricsMock";

describe("MetricsElement", () => {
    let node;

    // element.click() doesn't work on Travis Chrome
    function simulateClick(metricsElement, target) {
        const callback = metricsElement._handleClick.bind(metricsElement);
        metricsElement._trackBindingListener.target._handleClick(callback, {
            target,
            button: 0
        });
    }

    beforeEach(() => {
        node = document.createElement("div");
        MetricsConfig.autoTrackPageView = false;
    });

    afterEach(() => {
        try {
            ReactDOM.unmountComponentAtNode(node);
        } catch (err) {}
    });

    it("throws when used w/o metrics HOC", () => {
        class Application extends React.Component {
            componentDidMount() {
                simulateClick(this.refs.metricsElement, this.refs.img);
            }
            render() {
                return (
                    <MetricsElement ref="metricsElement">
                        <a
                            data-metrics-event-name="SomeEvent"
                            data-metrics-value="SomeVavlue"
                        >
                            <img
                                alt=""
                                ref="img"
                                src="http://placehold.it/200x150?text=Image"
                            />
                        </a>
                    </MetricsElement>
                );
            }
        }
        expect(() => {
            ReactDOM.render(<Application />, node);
        }).to.throw(
            "MetricsElement requires metrics HOC to exist in the parent tree."
        );
    });

    it("should send tracking as empty wrapper", done => {
        @metrics(MetricsConfig)
        class Application extends React.Component {
            componentDidMount() {
                simulateClick(this.refs.metricsElement, this.refs.img);
            }
            render() {
                return (
                    <MetricsElement ref="metricsElement">
                        <a
                            data-metrics-event-name="SomeEvent"
                            data-metrics-value="SomeVavlue"
                        >
                            <img
                                alt=""
                                ref="img"
                                src="http://placehold.it/200x150?text=Image"
                            />
                        </a>
                    </MetricsElement>
                );
            }
        }

        const track = sinon.stub(
            metricsMock.api,
            "track",
            (eventName, params) => {
                expect(eventName).to.equal("SomeEvent");
                expect(params).to.eql({value: "SomeVavlue"});
                track.restore();
                done();
            }
        );
        sinon.stub(Application.prototype, "_getMetrics", () => {
            return metricsMock;
        });

        ReactDOM.render(<Application />, node);
    });

    it("should send tracking as an html element", done => {
        @metrics(MetricsConfig)
        class Application extends React.Component {
            componentDidMount() {
                simulateClick(this.refs.metricsElement, this.refs.img);
            }
            render() {
                return (
                    <MetricsElement
                        data-metrics-event-name="SomeEvent"
                        data-metrics-value="SomeVavlue"
                        element="div"
                        ref="metricsElement"
                    >
                        <a>
                            <img
                                alt=""
                                ref="img"
                                src="http://placehold.it/200x150?text=Image"
                            />
                        </a>
                    </MetricsElement>
                );
            }
        }

        const track = sinon.stub(
            metricsMock.api,
            "track",
            (eventName, params) => {
                expect(eventName).to.equal("SomeEvent");
                expect(params).to.eql({value: "SomeVavlue"});
                track.restore();
                done();
            }
        );
        sinon.stub(Application.prototype, "_getMetrics", () => {
            return metricsMock;
        });

        ReactDOM.render(<Application />, node);
    });

    it("should send tracking as a component", done => {
        class Comp extends React.Component {
            static propTypes = {
                children: PropTypes.node
            };
            render() {
                return (
                    <div>
                        {React.cloneElement(this.props.children, {
                            ...this.props
                        })}
                    </div>
                );
            }
        }

        @metrics(MetricsConfig)
        class Application extends React.Component {
            componentDidMount() {
                simulateClick(this.refs.metricsElement, this.refs.img);
            }
            render() {
                return (
                    <MetricsElement
                        data-metrics-event-name="SomeEvent"
                        data-metrics-value="SomeVavlue"
                        element={Comp}
                        ref="metricsElement"
                    >
                        <a>
                            <img
                                alt=""
                                ref="img"
                                src="http://placehold.it/200x150?text=Image"
                            />
                        </a>
                    </MetricsElement>
                );
            }
        }

        const track = sinon.stub(
            metricsMock.api,
            "track",
            (eventName, params) => {
                expect(eventName).to.equal("SomeEvent");
                expect(params).to.eql({value: "SomeVavlue"});
                track.restore();
                done();
            }
        );
        sinon.stub(Application.prototype, "_getMetrics", () => {
            return metricsMock;
        });

        ReactDOM.render(<Application />, node);
    });

    it("should send tracking as a component instance", done => {
        class Comp extends React.Component {
            static propTypes = {
                children: PropTypes.node
            };
            render() {
                return (
                    <div>
                        {React.cloneElement(this.props.children, {
                            ...this.props
                        })}
                    </div>
                );
            }
        }

        @metrics(MetricsConfig)
        class Application extends React.Component {
            componentDidMount() {
                simulateClick(this.refs.metricsElement, this.refs.img);
            }
            render() {
                const comp = (
                    <Comp
                        data-metrics-event-name="SomeEvent"
                        data-metrics-value="SomeVavlue"
                    >
                        <a>
                            <img
                                alt=""
                                ref="img"
                                src="http://placehold.it/200x150?text=Image"
                            />
                        </a>
                    </Comp>
                );
                return <MetricsElement element={comp} ref="metricsElement" />;
            }
        }

        const track = sinon.stub(
            metricsMock.api,
            "track",
            (eventName, params) => {
                expect(eventName).to.equal("SomeEvent");
                expect(params).to.eql({value: "SomeVavlue"});
                track.restore();
                done();
            }
        );
        sinon.stub(Application.prototype, "_getMetrics", () => {
            return metricsMock;
        });

        ReactDOM.render(<Application />, node);
    });
});
