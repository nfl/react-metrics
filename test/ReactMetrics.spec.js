/* eslint-disable import/namespace */
import * as specs from "./ReactMetrics";

export default () => {
    describe("React Metrics", () => {
        for (const spec in specs) {
            if (specs.hasOwnProperty(spec)) {
                specs[spec].call(this);
            }
        }
    });
};
