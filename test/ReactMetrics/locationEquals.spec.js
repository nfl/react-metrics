import locationEquals from "../../src/react/locationEquals";

describe("locationEquals", () => {
    it("should check against both falsy value", () => {
        const a = null;
        const b = false;
        expect(locationEquals(a, b)).to.be.true;
    });

    it("should correctly validate location equality", () => {
        const a = {
            pathname: "/a/b",
            search: "?param=value",
            state: {
                prop1: true,
                deepProp: {
                    a: "a",
                    b: "b"
                }
            }
        };
        let b = {
            pathname: "/a/b",
            search: "?param=value",
            state: {
                prop1: true,
                deepProp: {
                    a: "a",
                    b: "b"
                }
            }
        };
        expect(locationEquals(a, b)).to.be.true;
        b = {
            pathname: "/a/c",
            search: "?param=value",
            state: {
                prop1: true,
                deepProp: {
                    a: "a",
                    b: "b"
                }
            }
        };
        expect(locationEquals(a, b)).to.be.false;
        b = {
            pathname: "/a/b",
            search: "?param=value2",
            state: {
                prop1: true,
                deepProp: {
                    a: "a",
                    b: "b"
                }
            }
        };
        expect(locationEquals(a, b)).to.be.false;
        b = {
            pathname: "/a/b",
            search: "?param=value",
            state: {
                prop1: true,
                deepProp: {
                    a: "a",
                    b: "c"
                }
            }
        };
        expect(locationEquals(a, b)).to.be.false;
    });
});
