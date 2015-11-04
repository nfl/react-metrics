import extractApis, {filterKeysByType} from "../../src/core/utils/extractApis";
export default () => {
    describe("extractApis", () => {
        it("extracts method names from object", () => {
            const service = {
                methodA() {},
                methodB() {}
            };
            const result = extractApis(service);
            expect(result).to.be.an("array");
            expect(result).to.have.length(2);
            expect(result).to.have.members(["methodA", "methodB"]);
        });

        it("extracts method names from extended object", () => {
            const parent = {
                methodA() {}
            };
            const service = Object.create(parent, {
                methodB: {value: function () {}}
            });
            const result = extractApis(service);
            expect(result).to.be.an("array");
            expect(result).to.have.length(2);
            expect(result).to.have.members(["methodA", "methodB"]);
        });

        it("extracts method names from class instance", () => {
            class ServiceClass {
                methodA() {}
                methodB() {}
            }
            const service = new ServiceClass();
            const result = extractApis(service);
            expect(result).to.be.an("array");
            expect(result).to.have.length(2);
            expect(result).to.have.members(["methodA", "methodB"]);
        });

        it("extracts method names from inherited class instance", () => {
            class ParentClass {
                methodA() {}
            }
            class ServiceClass extends ParentClass {
                methodB() {}
            }
            const service = new ServiceClass();
            const result = extractApis(service);
            expect(result).to.be.an("array");
            expect(result).to.have.length(2);
            expect(result).to.have.members(["methodA", "methodB"]);
        });

        it("extracts method names from prototypal class instance", () => {
            function ServiceClass() {}
            ServiceClass.prototype = {
                methodA() {},
                methodB() {}
            };
            const service = new ServiceClass();
            const result = extractApis(service);
            expect(result).to.be.an("array");
            expect(result).to.have.length(2);
            expect(result).to.have.members(["methodA", "methodB"]);
        });

        it("extracts method names from inherited prototypal class instance", () => {
            function ParentClass() {}
            ParentClass.prototype = {
                methodA() {}
            };
            function ServiceClass() {}
            ServiceClass.prototype = new ParentClass();
            ServiceClass.prototype.methodB = function () {};
            const service = new ServiceClass();
            const result = extractApis(service);
            expect(result).to.be.an("array");
            expect(result).to.have.length(2);
            expect(result).to.have.members(["methodA", "methodB"]);
        });

        it("excludes method starting with '_'", () => {
            const service = {
                methodA() {},
                _methodB() {}
            };
            const result = extractApis(service);
            expect(result).to.be.an("array");
            expect(result).to.have.length(1);
            expect(result).to.have.members(["methodA"]);
            expect(result).to.not.have.members(["_methodB"]);
        });

        it("extracts method names from an array of mixed object", () => {
            const service1 = {
                methodA() {},
                methodB() {},
                methodC() {}
            };
            class ServiceClass {
                methodB() {}
                methodC() {}
                methodD() {}
            }
            const service2 = new ServiceClass();
            const result = extractApis([service1, service2]);
            expect(result).to.be.an("array");
            expect(result).to.have.length(4);
            expect(result).to.have.members(["methodA", "methodB", "methodC", "methodD"]);
        });

        it("uses total and type for filterKeysByType", () => {
            let result = filterKeysByType({
                methodA() {},
                methodB() {}
            });
            expect(result).to.be.an("array");
            expect(result).to.have.length(2);
            expect(result).to.have.members(["methodA", "methodB"]);

            result = filterKeysByType({
                methodA() {},
                methodB() {},
                methodC() {}
            }, ["methodB"]);
            expect(result).to.be.an("array");
            expect(result).to.have.length(2);
            expect(result).to.have.members(["methodA", "methodC"]);

            result = filterKeysByType({
                methodA: "methodA",
                methodB: "methodB"
            }, [], "string");
            expect(result).to.be.an("array");
            expect(result).to.have.length(2);
            expect(result).to.have.members(["methodA", "methodB"]);
        });
    });
};
