/* eslint-disable import/namespace */
import * as specs from "./core";

export default () => {
    describe("Core", () => {
        for (const spec in specs) {
            if (specs.hasOwnProperty(spec)) {
                specs[spec].call(this);
            }
        }
    });
};
