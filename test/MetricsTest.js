import "../src/polyfill";
import ReactMetricsSpec from "./ReactMetrics.spec";
import coreSpec from "./core.spec";

describe("React Metrics", () => {
    coreSpec();
    ReactMetricsSpec();
});
