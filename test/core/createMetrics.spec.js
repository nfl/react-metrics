/* eslint-disable react/no-multi-comp, max-nested-callbacks, react/prop-types, no-empty */
import createMetrics, {Metrics} from "../../src/core/createMetrics";
import ActionTypes from "../../src/core/ActionTypes";
import isPromise from "../../src/core/utils/isPromise";
import metricsConfig from "../metrics.config";
import {addChildToNode, removeChildFromNode} from "../nodeUtils";

describe("Metrics", () => {
    it("throws on missing 'vendors' in options", () => {
        expect(() => {
            new Metrics();
        }).to.throw("'vendors' option is required.");
    });

    it("uses default 'pageDefaults'", () => {
        const missingPageDefaultsConfig = Object.assign({}, metricsConfig, {
            pageDefaults: null
        });
        const metricsInstance = new Metrics(missingPageDefaultsConfig);
        expect(metricsInstance.pageDefaults()).to.eql({});
    });

    it("converts 'vendors' to an array", () => {
        const vendor = {name: "test"};
        const missingPageDefaultsConfig = Object.assign({}, metricsConfig, {
            vendors: vendor
        });
        const metricsInstance = new Metrics(missingPageDefaultsConfig);
        expect(metricsInstance.vendors).to.be.an.array;
        expect(metricsInstance.vendors[0]).to.eql(vendor);
    });

    it("should be disabled when dom is not available", () => {
        const missingPageDefaultsConfig = Object.assign({}, metricsConfig, {
            canUseDOM: false
        });
        const metricsInstance = new Metrics(missingPageDefaultsConfig);
        expect(metricsInstance.enabled).to.be.false;
    });

    it("should not enable 'useTrackBinding' when Metrics is disabled", () => {
        const missingPageDefaultsConfig = Object.assign({}, metricsConfig, {
            enabled: false
        });
        const metricsInstance = new Metrics(missingPageDefaultsConfig);
        const remove = metricsInstance.useTrackBinding();
        expect(remove).to.be.undefined;
    });

    it("throws when enabling 'useTrackBinding' but 'track' api is not defined", () => {
        const vendor = {
            api: {test() {}}
        };
        const missingPageDefaultsConfig = Object.assign({}, metricsConfig, {
            vendors: vendor
        });
        const metricsInstance = new Metrics(missingPageDefaultsConfig);
        expect(() => {
            metricsInstance.useTrackBinding();
        }).to.throw(
            "Metrics 'track' method needs to be defined for declarative tracking."
        );
    });

    it("should not let 'useTrackBinding' listen twice", () => {
        const stub = sinon.stub(Metrics.prototype, "_handleClick");

        const node = document.createElement("div");
        document.body.appendChild(node);

        addChildToNode(node, {
            tagName: "a",
            attrs: {
                href: "#",
                "data-metrics-event-name": "myEvent",
                "data-metrics-prop": "value"
            },
            content: "Link to Track"
        });

        const metricsInstance = new Metrics(metricsConfig);
        metricsInstance.useTrackBinding();
        const unsubscribe = metricsInstance.useTrackBinding();

        const linkNode = node.firstChild;
        linkNode.click();

        stub.should.have.callCount(1);
        stub.restore();

        removeChildFromNode(node);
        unsubscribe();
    });

    it("should let 'useTrackBinding' unlisten event", () => {
        const stub = sinon.stub(Metrics.prototype, "_handleClick");

        const node = document.createElement("div");
        document.body.appendChild(node);

        addChildToNode(node, {
            tagName: "a",
            attrs: {
                href: "#",
                "data-metrics-event-name": "myEvent",
                "data-metrics-prop": "value"
            },
            content: "Link to Track"
        });

        const metricsInstance = new Metrics(metricsConfig);
        metricsInstance.useTrackBinding();

        const linkNode = node.firstChild;
        linkNode.click();
        stub.should.have.callCount(1);
        stub.reset();

        // unlisten by passing 'false'.
        metricsInstance.useTrackBinding(false);
        linkNode.click();
        stub.should.have.callCount(0);
        stub.reset();

        // listen again
        const unsubscribe = metricsInstance.useTrackBinding();
        linkNode.click();
        stub.should.have.callCount(1);
        stub.reset();

        // unlisten by calling remove on listener.
        unsubscribe();
        linkNode.click();
        stub.should.have.callCount(0);

        stub.restore();

        removeChildFromNode(node);
    });

    it("should call track api when 'useTrackBinding' is enabled", done => {
        const node = document.createElement("div");
        document.body.appendChild(node);

        addChildToNode(node, {
            tagName: "a",
            attrs: {
                href: "#",
                "data-metrics-event-name": "myEvent",
                "data-metrics-prop": "value"
            },
            content: "Link to Track"
        });

        const metricsInstance = new Metrics(metricsConfig);
        const unsubscribe = metricsInstance.useTrackBinding();

        metricsInstance.apiImpl = {
            track(eventName, params) {
                expect(eventName).to.equal("myEvent");
                expect(params).to.eql({prop: "value"});
                done();
            }
        };

        const linkNode = node.firstChild;
        linkNode.click();

        removeChildFromNode(node);
        unsubscribe();
    });

    it("allows a client to listen event", done => {
        const metricsInstance = new Metrics(metricsConfig);
        metricsInstance.listen(event => {
            expect(event).to.have.property("type").and.equal("identify");
            expect(event).to.have.property("status").and.equal("success");
        });
        metricsInstance.listen(event => {
            expect(event).to.have.property("type").and.equal("identify");
            expect(event).to.have.property("status").and.equal("success");
            done();
        });
        metricsInstance.api.identify({user: "testUser"});
    });

    it("allows a client to listen event by api", done => {
        const metricsInstance = new Metrics(metricsConfig);
        metricsInstance.listen("pageView", event => {
            expect(event).to.have.property("type").and.equal("pageView");
            expect(event).to.have.property("status").and.equal("success");
            done();
        });
        metricsInstance.api.pageView();
    });

    it("allows a client to unlisten event", done => {
        const metricsInstance = new Metrics(metricsConfig);
        const spy = sinon.spy();
        const unsubscribe = metricsInstance.listen(spy);
        metricsInstance.api.identify({user: "testUser"});
        setTimeout(() => {
            spy.should.have.callCount(1);
            spy.reset();
            unsubscribe();
            metricsInstance.api.identify({user: "testUser"});
            setTimeout(() => {
                spy.should.have.callCount(0);
                done();
            }, 0);
        }, 0);
    });

    it("allows a client to unlisten event by api", done => {
        const metricsInstance = new Metrics(metricsConfig);
        const spy = sinon.spy();
        const unsubscribe = metricsInstance.listen("pageView", spy);
        unsubscribe();
        metricsInstance.api.pageView();
        setTimeout(() => {
            spy.should.have.callCount(0);
            done();
        }, 0);
    });

    it("allows a custom vendor method without arguments", done => {
        const metricsInstance = new Metrics(metricsConfig);
        metricsInstance.listen(event => {
            expect(event)
                .to.have.property("type")
                .and.equal("someMethod");
            expect(event)
                .to.have.property("status")
                .and.equal("success");
            done();
        });
        metricsInstance.api.someMethod();
    });

    it("should have console log when debug flag is set", done => {
        const missingPageDefaultsConfig = Object.assign({}, metricsConfig, {
            debug: true
        });
        const metricsInstance = new Metrics(missingPageDefaultsConfig);
        const stub = sinon.stub(console, "log", (logName, event) => {
            expect(logName).to.equal("track result");
            expect(event).to.have.property("type").and.equal("pageView");
            expect(event).to.have.property("status").and.equal("success");
            done();
            stub.restore();
        });
        metricsInstance.api.pageView();
    });
});

describe("createMetrics", () => {
    const defaultData = metricsConfig.pageDefaults();

    it("exposes expected method.", () => {
        const metricsInstance = createMetrics(metricsConfig);
        expect(metricsInstance).to.respondTo("listen");
        expect(metricsInstance).to.respondTo("setRouteState");
        expect(metricsInstance).to.respondTo("useTrackBinding");
        expect(metricsInstance).to.respondTo("destroy");
    });

    it("exposes expected api.", () => {
        const metricsInstance = createMetrics(metricsConfig);
        expect(metricsInstance.api).to.respondTo("pageView");
        expect(metricsInstance.api).to.respondTo("track");
        expect(metricsInstance.api).to.respondTo("identify");
    });

    it("can't modify api.", () => {
        const metricsInstance = createMetrics(metricsConfig);

        metricsInstance.api.someApi = () => {};
        expect(metricsInstance.api).not.to.respondTo("someApi");

        metricsInstance.api.pageView = () => {
            return 1;
        };
        expect(metricsInstance.api.pageView()).to.be.undefined;
    });

    it("should not track page view when metrics is disabled.", () => {
        const metricsInstance = createMetrics(
            Object.assign({}, metricsConfig, {enabled: false})
        );
        const stub = sinon.stub(Metrics.prototype, "_doTrack");
        metricsInstance.api.pageView();
        expect(stub.calledOnce).to.be.false;
        stub.restore();
    });

    it("should auto track page view with expected arguments.", done => {
        const metricsInstance = createMetrics(metricsConfig);
        const stub = sinon.stub(Metrics.prototype, "_doTrack", (...args) => {
            expect(args[0]).to.equal(ActionTypes.PAGE_VIEW);
            expect(isPromise(args[1])).to.be.true;
            args[1].then(params => {
                expect(params.length).to.equal(2);
                expect(params[0]).to.equal(metricsConfig.pageViewEvent);
                expect(JSON.stringify(params[1])).to.equal(
                    JSON.stringify(defaultData)
                );
                stub.restore();
                done();
            });
        });
        metricsInstance.api.pageView();
    });

    it("should emits event with expected payload", done => {
        const metricsInstance = createMetrics(metricsConfig);
        const emitStub = sinon.stub(
            Metrics.prototype,
            "emit",
            (type, event) => {
                expect(type).to.equal("pageView");
                expect(event.type).to.equal("pageView");
                expect(event.status).to.equal("success");
                expect(event.response).to.have.length(2);
                expect(JSON.stringify(event.response[0])).to.equal(
                    JSON.stringify({
                        name: metricsConfig.vendors[0].name,
                        params: [metricsConfig.pageViewEvent, defaultData],
                        response: {
                            eventName: metricsConfig.pageViewEvent,
                            params: defaultData
                        },
                        status: "success"
                    })
                );
                expect(JSON.stringify(event.response[1])).to.equal(
                    JSON.stringify({
                        name: metricsConfig.vendors[1].name,
                        params: [metricsConfig.pageViewEvent, defaultData],
                        response: {
                            eventName: metricsConfig.pageViewEvent,
                            params: defaultData
                        },
                        status: "success"
                    })
                );
                emitStub.restore();
                done();
            }
        );
        metricsInstance.api.pageView();
    });

    it("should be able to track page view with additional default metrics.", done => {
        const customData = {
            siteName: "I",
            season: "J"
        };
        const metricsInstance = createMetrics(
            Object.assign({}, metricsConfig, {customParams: customData})
        );
        const stub = sinon.stub(Metrics.prototype, "_doTrack", (...args) => {
            expect(isPromise(args[1])).to.be.true;
            args[1].then(params => {
                expect(JSON.stringify(params[1])).to.equal(
                    JSON.stringify(Object.assign({}, defaultData, customData))
                );
                stub.restore();
                done();
            });
        });
        metricsInstance.api.pageView();
    });

    it("should be able to track page view with additional page view metrics as promise.", done => {
        const metricsInstance = createMetrics(metricsConfig);
        const customData = {
            pageName: "I",
            content: "J"
        };
        const stub = sinon.stub(Metrics.prototype, "_doTrack", (...args) => {
            args[1].then(params => {
                expect(JSON.stringify(params[1])).to.equal(
                    JSON.stringify(Object.assign({}, defaultData, customData))
                );
                stub.restore();
                done();
            });
        });
        metricsInstance.api.pageView(Promise.resolve(customData));
    });

    it("should be able to track page view with additional page view metrics as object.", done => {
        const metricsInstance = createMetrics(metricsConfig);
        const customData = {
            pageName: "I",
            content: "J"
        };
        const stub = sinon.stub(Metrics.prototype, "_doTrack", (...args) => {
            args[1].then(params => {
                expect(JSON.stringify(params[1])).to.equal(
                    JSON.stringify(Object.assign({}, defaultData, customData))
                );
                stub.restore();
                done();
            });
        });
        metricsInstance.api.pageView(customData);
    });

    it("should be able to track page view with custom page view event name.", done => {
        const metricsInstance = createMetrics(metricsConfig);
        const customPageViewRule = "customPageLoad";
        const customData = {
            pageName: "I",
            content: "J"
        };
        const stub = sinon.stub(Metrics.prototype, "_doTrack", (...args) => {
            expect(args[0]).to.equal(ActionTypes.PAGE_VIEW);
            args[1].then(params => {
                expect(params[0]).to.equal(customPageViewRule);
                expect(JSON.stringify(params[1])).to.equal(
                    JSON.stringify(Object.assign({}, defaultData, customData))
                );
                stub.restore();
                done();
            });
        });
        metricsInstance.api.pageView(customPageViewRule, customData);
    });

    it("should cancel pending page view track when the route changes.", done => {
        const metricsInstance = createMetrics(metricsConfig);

        const stub = sinon.stub(Metrics.prototype, "_doTrack", (...args) => {
            args[1].catch(err => {
                expect(err.message).to.equal("Page view cancelled");
                stub.restore();
                done();
            });
        });
        metricsInstance.api.pageView();
        metricsInstance.setRouteState(); // this triggers marking any pending promise to reject when resolving.
        metricsInstance.api.pageView();
    });

    it("should not cancel pending page view track when the route changes if 'cancelOnNext' is set to false.", done => {
        const metricsInstance = createMetrics(
            Object.assign({cancelOnNext: false}, metricsConfig)
        );
        let count = 0;

        const stub = sinon.stub(Metrics.prototype, "_doTrack", (...args) => {
            args[1].then(() => {
                if (++count === 2) {
                    stub.restore();
                    done();
                }
            });
        });
        metricsInstance.api.pageView();
        metricsInstance.setRouteState(); // this triggers marking any pending promise to reject when resolving.
        metricsInstance.api.pageView();
    });

    it("should be able to track custom link.", done => {
        const metricsInstance = createMetrics(metricsConfig);
        const trackId = "customTrackId";
        const customData = {
            pageName: "I",
            content: "J"
        };

        const stub = sinon.stub(Metrics.prototype, "_doTrack", (...args) => {
            expect(args[0]).to.equal(ActionTypes.TRACK);
            args[1].then(params => {
                expect(params[0]).to.equal(trackId);
                expect(JSON.stringify(params[1])).to.equal(
                    JSON.stringify(Object.assign({}, customData))
                );
                stub.restore();
                done();
            });
        });
        metricsInstance.api.track(trackId, customData);
    });

    it("should be able to track custom link with default metrics merged.", done => {
        const metricsInstance = createMetrics(metricsConfig);
        const trackId = "customTrackId";
        const customData = {
            pageName: "I",
            content: "J"
        };

        const emitStub = sinon.stub(
            Metrics.prototype,
            "emit",
            (type, event) => {
                expect(type).to.equal(ActionTypes.TRACK);
                expect(event.type).to.equal(ActionTypes.TRACK);
                expect(event.status).to.equal("success");
                const mergedData = Object.assign(defaultData, customData);
                expect(JSON.stringify(event.response[0])).to.equal(
                    JSON.stringify({
                        name: metricsConfig.vendors[0].name,
                        params: [trackId, mergedData],
                        response: {eventName: trackId, params: mergedData},
                        status: "success"
                    })
                );
                emitStub.restore();
                done();
            }
        );
        const stub = sinon.stub(Metrics.prototype, "_doTrack", (...args) => {
            expect(args[0]).to.equal(ActionTypes.TRACK);
            args[1].then(params => {
                expect(params[0]).to.equal(trackId);
                expect(JSON.stringify(params[1])).to.equal(
                    JSON.stringify(Object.assign({}, defaultData, customData))
                );
                stub.restore();
                metricsInstance.api.track(trackId, customData, true);
            });
        });
        metricsInstance.api.track(trackId, customData, true);
    });

    it("should be able to call custom api.", done => {
        const metricsInstance = createMetrics(metricsConfig);
        const data = {
            id: "metrics123",
            email: "react.metrics@example.com"
        };

        const emitStub = sinon.stub(
            Metrics.prototype,
            "emit",
            (type, event) => {
                expect(type).to.equal("identify");
                expect(event.type).to.equal("identify");
                expect(event.status).to.equal("success");
                expect(JSON.stringify(event.response[0])).to.equal(
                    JSON.stringify({
                        name: metricsConfig.vendors[0].name,
                        params: data,
                        response: undefined,
                        status: "success"
                    })
                );
                emitStub.restore();
                done();
            }
        );
        const stub = sinon.stub(Metrics.prototype, "_doTrack", (...args) => {
            expect(args[0]).to.equal("identify");
            args[1].then(params => {
                expect(params).to.eql(data);
                stub.restore();
                metricsInstance.api.identify(data);
            });
        });
        metricsInstance.api.identify(data);
    });

    it("should emit failure status when tracking fails.", done => {
        const vendor = {
            api: {
                track() {
                    return Promise.reject("Error tracking");
                }
            }
        };
        const data = ["myEvent", undefined];
        const metricsInstance = createMetrics(
            Object.assign({}, metricsConfig, {vendors: vendor})
        );

        const emitStub = sinon.stub(
            Metrics.prototype,
            "emit",
            (type, event) => {
                expect(type).to.equal("track");
                expect(event.type).to.equal("track");
                expect(event.status).to.equal("failure");
                expect(JSON.stringify(event.response[0])).to.equal(
                    JSON.stringify({
                        name: vendor.name,
                        params: data,
                        response: undefined,
                        error: "Error tracking",
                        status: "failure"
                    })
                );
                emitStub.restore();
                done();
            }
        );
        const stub = sinon.stub(Metrics.prototype, "_doTrack", (...args) => {
            expect(args[0]).to.equal("track");
            args[1].then(params => {
                expect(params).to.eql(data);
                stub.restore();
                metricsInstance.api.track(...data);
            });
        });
        metricsInstance.api.track(...data);
    });
});
