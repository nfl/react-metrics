import createService from "../../src/core/createService";

describe("createService", () => {
    it("provides default 'pageView' and 'track'", () => {
        let service = createService();
        expect(service).to.have.property("name", undefined);
        expect(service.apis.pageView).to.exist;
        expect(service.apis.track).to.exist;
        expect(() => {
            service.apis.pageView();
            service.apis.track();
        }).to.not.throw();

        const options = {
            api: function () {}
        };
        service = createService(options);
        expect(service).to.have.property("name", undefined);
        expect(service.apis.pageView).to.exist;
        expect(service.apis.track).to.exist;
    });

    it("does not require 'pageView' and 'track' to be defined", () => {
        const options = {
            name: "Test",
            api: {
                methodA() {}
            }
        };
        const service = createService(options);
        expect(service).to.have.property("name", options.name);
        expect(service.apis.methodA).to.exist;
        expect(service.apis.pageView).to.not.exist;
        expect(service.apis.track).to.not.exist;
    });

    it("can handle object", () => {
        const options = {
            name: "Test",
            api: {
                pageView() {},
                track() {},
                methodA() {}
            }
        };
        const service = createService(options);
        expect(service).to.have.property("name", options.name);
        expect(service.apis.pageView).to.exist;
        expect(service.apis.track).to.exist;
        expect(service.apis.methodA).to.exist;
    });

    it("can handle extended object", () => {
        const parent = {
            pageView() {}
        };
        const api = Object.create(parent, {
            track: {value: function () {}},
            methodA: {value: function () {}}
        });
        const options = {
            name: "Test",
            api
        };
        const service = createService(options);
        expect(service).to.have.property("name", options.name);
        expect(service.apis.pageView).to.exist;
        expect(service.apis.track).to.exist;
        expect(service.apis.methodA).to.exist;
    });

    it("can handle class", () => {
        class ServiceClass {
            pageView() {}
            track() {}
            methodA() {}
        }
        const options = {
            name: "Test",
            api: ServiceClass
        };
        const service = createService(options);
        expect(service).to.have.property("name", options.name);
        expect(service.apis.pageView).to.exist;
        expect(service.apis.track).to.exist;
        expect(service.apis.methodA).to.exist;
    });

    it("can handle class instance", () => {
        class ServiceClass {
            pageView() {}
            track() {}
            methodA() {}
        }
        const options = {
            name: "Test",
            api: new ServiceClass()
        };
        const service = createService(options);
        expect(service).to.have.property("name", options.name);
        expect(service.apis.pageView).to.exist;
        expect(service.apis.track).to.exist;
        expect(service.apis.methodA).to.exist;
    });

    it("can handle extended class", () => {
        class ParentClass {
            pageView() {}
            track() {}
            methodA() {}
        }
        class ServiceClass extends ParentClass {

        }
        const options = {
            name: "Test",
            api: ServiceClass
        };
        const service = createService(options);
        expect(service).to.have.property("name", options.name);
        expect(service.apis.pageView).to.exist;
        expect(service.apis.track).to.exist;
        expect(service.apis.methodA).to.exist;
    });

    it("can handle function", () => {
        function getService() {
            return {
                pageView() {},
                track() {},
                methodA() {}
            };
        }
        const options = {
            name: "Test",
            api: getService
        };
        const service = createService(options);
        expect(service).to.have.property("name", options.name);
        expect(service.apis.pageView).to.exist;
        expect(service.apis.track).to.exist;
        expect(service.apis.methodA).to.exist;
    });

    it("can override 'name' property from options", () => {
        class ServiceClass {
            constructor() {
                this.name = "Test";
            }
            pageView() {}
            track() {}
            methodA() {}
        }
        const options = {
            api: ServiceClass
        };
        const options2 = {
            name: "Test Override",
            api: ServiceClass
        };
        const service = createService(options);
        const service2 = createService(options2);
        expect(service).to.have.property("name", "Test");
        expect(service2).to.have.property("name", "Test Override");
    });
});
