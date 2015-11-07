import "../../src/polyfill";
import getRouteState from "../../src/react/getRouteState";

describe("getRouteState", () => {
    it("should return new location when param is included", () => {
        const newProps = {
            location: {
                pathname: "/",
                hash: "",
                search: "",
                state: null
            },
            params: {
                param: "value"
            }
        };
        expect(getRouteState(newProps)).to.not.eql(newProps.location);

        const newProps2 = {
            location: {
                pathname: "/",
                hash: "",
                search: "",
                state: null,
                params: {
                    param: "value"
                }
            }
        };
        expect(getRouteState(newProps2)).to.equal(newProps2.location);
    });
});
